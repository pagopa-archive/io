/**
 * This task deploys the Azure API Management resource.
 *
 * This task assumes that the following resources are already created:
 *  - Resource group
 *  - Functions (app service)
 *
 * Unfortunately you cannot migrate Widgets and Media Libray:
 * https://{publisherPortalName}.portal.azure-api.net/Admin/Widgets
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as t from "io-ts";

import { reporter } from "io-ts-reporters";

import * as winston from "winston";

import yargs = require("yargs");

import { ICreds, login } from "../../lib/login";
import { getFunctionsInfo } from "../../lib/task_utils";

import { checkEnvironment } from "../../lib/environment";

import apiManagementClient = require("azure-arm-apimanagement");
import webSiteManagementClient = require("azure-arm-website");

import * as path from "path";
import * as shelljs from "shelljs";
import * as tmp from "tmp";
import * as url from "url";

import { left } from "fp-ts/lib/Either";

import * as replaceInFiles from "replace-in-file";
import {
  CONF_DIR,
  getObjectFromJson,
  readConfig,
  ResourcesConfiguration
} from "../../lib/config";

// tslint:disable-next-line:no-object-mutation
shelljs.config.fatal = true;
// shelljs.config.verbose = true;

const CONFIGURATION_DIRECTORY_NAME = "apim";
const CONFIGURATION_DIRECTORY_PATH = path.resolve(
  __dirname,
  `../${CONFIGURATION_DIRECTORY_NAME}`
);

interface IApimProperties {
  readonly [s: string]: {
    readonly secret: boolean;
    readonly value: string;
  };
}

const ApimParams = t.interface({
  apim_configuration_path: t.string,
  azurerm_apim: t.string,
  azurerm_functionapp: t.string,
  azurerm_resource_group: t.string,
  environment: t.string
});

type ApimParams = t.TypeOf<typeof ApimParams>;

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * For each published.html file found in tmpDirName/portalTemplates
 * replace `${var_name}` with the relative value found in configuration
 */
const replaceVariables = (
  tmpDirName: string,
  config: ResourcesConfiguration,
  params: ApimParams
) => {
  const templateFiles = path.join(
    tmpDirName,
    CONFIGURATION_DIRECTORY_NAME,
    "api-management",
    "portalTemplates",
    "**/published.html"
  );
  const vars = { ...config, ...params };
  return replaceInFiles.sync({
    files: templateFiles,
    from: /\$\{[^}]+\}/g,
    to: (found: string) => {
      const varName = /\${(.+)}/.exec(found);
      const value = (vars as any)[varName ? varName[1] : ""];
      if (value === null || value === "") {
        throw new Error(`Cannot find configuration variable for ${found}`);
      }
      winston.info(`Replaced ${found} with ${value} in template.`);
      return value;
    }
  });
};

/**
 * Set a named valued (property)
 * see https://docs.microsoft.com/en-us/azure/api-management/api-management-howto-properties
 */
const setupProperties = async (
  apiClient: apiManagementClient,
  params: ApimParams,
  properties: IApimProperties
) => {
  winston.info(
    "Setup Functions application key in the API management settings"
  );
  return await Promise.all(
    Object.keys(properties).map(async prop => {
      return await apiClient.property.createOrUpdate(
        params.azurerm_resource_group,
        params.azurerm_apim,
        prop,
        {
          displayName: prop,
          name: prop,
          secret: properties[prop].secret,
          value: properties[prop].value
        }
      );
    })
  );
};

/**
 * Set up API management
 *  - Products
 *  - Groups
 *  - Policies
 *  - API operations from Functions
 *  - Email templates
 *  - Developer portal templates
 *  - Configuration settings (named values)
 */
const setupConfigurationFromGit = async (
  apiClient: apiManagementClient,
  scmUrl: string,
  configurationDirectoryPath: string,
  config: ResourcesConfiguration,
  params: ApimParams
) => {
  winston.info("Get API management Git repository credentials");

  // Get API management configuration repository (git) credentials
  const gitKey = await apiClient.user.getSharedAccessToken(
    params.azurerm_resource_group,
    params.azurerm_apim,
    config.apim_scm_cred_username,
    {
      // Access token can have maximum expiry time of 30 days
      expiry: addDays(new Date(), 10),
      keyType: "primary"
    }
  );

  // Build Git URL with user and password
  const { hostname, protocol } = url.parse(scmUrl);
  const scmUrlWithCreds = url.format({
    ...{ hostname, protocol },
    auth: `${config.apim_scm_username}:${gitKey.value}`
  });

  // Push master branch
  // Actually, the only things we need to push are the developer portal templates
  // as there is no API to edit them programmatically
  const tmpDir = tmp.dirSync();
  if (!tmpDir) {
    throw new Error("Cannot create temporary directory");
  }
  shelljs.cp("-R", configurationDirectoryPath, tmpDir.name);
  shelljs.pushd(path.join(tmpDir.name, CONFIGURATION_DIRECTORY_NAME));

  const changes = replaceVariables(tmpDir.name, config, params);
  winston.info(
    `Replaced configuration parameters in ${JSON.stringify(changes)}`
  );

  winston.info(
    "Push local configuration to the master branch of the API management SCM repository"
  );

  shelljs.exec(`git init .`);
  shelljs.exec(`git remote add origin ${scmUrlWithCreds}`);
  shelljs.exec(`git add -A`);
  shelljs.exec(`git commit -a -m "configuration update"`);
  shelljs.exec(`git push origin master --force`);
  shelljs.popd();

  winston.info("Deploy configuration from master branch to API management");

  // Deploy configuration from pushed master branch
  const deploy = await apiClient.tenantConfiguration.deploy(
    params.azurerm_resource_group,
    params.azurerm_apim,
    {
      branch: "master",
      // deletes subscriptions to products that are deleted in this update
      force: true
    }
  );
  if (deploy.error) {
    throw new Error(JSON.stringify(deploy));
  }

  return gitKey;
};

const getPropsFromFunctions = async (
  loginCreds: ICreds,
  params: ApimParams
) => {
  winston.info("Get Functions application key and backend URL");

  // Get Functions (backend) info
  // We need these to setup API operations
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );

  const { masterKey, backendUrl } = await getFunctionsInfo(
    webSiteClient,
    params.azurerm_resource_group,
    params.azurerm_functionapp
  );

  return {
    backendUrl: { secret: false, value: backendUrl },
    code: { secret: true, value: masterKey }
  };
};

/**
 * Creates the API management PaaS
 */
const createOrUpdateApiManagementService = async (
  apiClient: apiManagementClient,
  config: ResourcesConfiguration,
  params: ApimParams
) => {
  winston.info(
    "Create API management resource, this takes a while (about 30 minutes)..."
  );
  const apiManagementService = await apiClient.apiManagementService.createOrUpdate(
    params.azurerm_resource_group,
    params.azurerm_apim,
    {
      location: config.location,
      notificationSenderEmail: config.apim_email,
      publisherEmail: config.apim_email,
      publisherName: config.apim_publisher,
      sku: { name: config.azurerm_apim_sku, capacity: 1 }
    }
  );
  return apiManagementService;
};

export const run = async (params: ApimParams) => {
  const config = readConfig(
    params.environment,
    path.join(...CONF_DIR, ...params.apim_configuration_path.split("/"))
  ).getOrElseL(errs => {
    throw new Error(
      "Error parsing configuration:\n\n" + reporter(left(errs) as any)
    );
  });

  const loginCreds = await login();

  // Needed to get storage connection string
  const apiClient = new apiManagementClient(
    loginCreds.creds,
    loginCreds.subscriptionId
  );

  const functionProperties = await getPropsFromFunctions(loginCreds, params);

  const apiManagementService = await createOrUpdateApiManagementService(
    apiClient,
    config,
    params
  );

  if (!apiManagementService.scmUrl) {
    throw new Error("Cannot get apiManagementService.scmUrl");
  }

  // Set up backend url and code (master key) named values
  // to access Functions endpoint in policies
  await setupProperties(apiClient, params, functionProperties);

  // Push API management configuration from local repository
  await setupConfigurationFromGit(
    apiClient,
    apiManagementService.scmUrl,
    CONFIGURATION_DIRECTORY_PATH,
    config,
    params
  );
};

const argv = yargs
  .option("environment", {
    demandOption: true,
    string: true
  })
  .option("azurerm_resource_group", {
    string: true
  })
  .option("azurerm_apim", {
    string: true
  })
  .option("azurerm_functionapp", {
    string: true
  })
  .option("apim_configuration_path", {
    string: true
  })
  .help().argv;

checkEnvironment()
  .then(() => getObjectFromJson(ApimParams, argv))
  .then(e =>
    e.map(run).mapLeft(err => {
      throw err;
    })
  )
  .then(() => winston.info("Completed"))
  .catch((e: Error) => winston.error(e.message));
