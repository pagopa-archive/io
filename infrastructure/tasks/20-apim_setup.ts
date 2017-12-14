/**
 * Run this task to deploy Azure API Manager:
 *
 * yarn resources:apim:setup
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

import * as winston from "winston";
import { login } from "../../lib/login";
import { getFunctionsInfo } from "../../lib/task_utils";

import { IResourcesConfiguration, readConfig } from "../../lib/config";
import { checkEnvironment } from "../../lib/environment";

import apiManagementClient = require("azure-arm-apimanagement");
import webSiteManagementClient = require("azure-arm-website");

import * as path from "path";
import * as shelljs from "shelljs";
import * as tmp from "tmp";
import * as url from "url";

import * as replaceInFiles from "replace-in-file";

// tslint:disable-next-line:no-object-mutation
shelljs.config.fatal = true;
// shelljs.config.verbose = true;

const CONFIGURATION_DIRECTORY_NAME = "apim";
const CONFIGURATION_DIRECTORY_PATH = path.resolve(
  __dirname,
  `../${CONFIGURATION_DIRECTORY_NAME}`
);

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * For each published.html file found in tmpDirName/portalTemplates
 * replace `${var_name}` with the relative value found in config.var_name
 */
const replaceVariables = (
  tmpDirName: string,
  config: IResourcesConfiguration
) => {
  const templateFiles = path.join(
    tmpDirName,
    CONFIGURATION_DIRECTORY_NAME,
    "api-management",
    "portalTemplates",
    "**/published.html"
  );
  return replaceInFiles.sync({
    files: templateFiles,
    from: /\$\{[^}]+\}/g,
    to: (found: string) => {
      const varName = /\${(.+)}/.exec(found);
      const value = (config as any)[varName ? varName[1] : ""];
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
const setApimProperties = async (
  apiClient: apiManagementClient,
  properties: {
    readonly [s: string]: { readonly secret: boolean; readonly value: string };
  },
  config: IResourcesConfiguration
) => {
  return await Promise.all(
    Object.keys(properties).map(async prop => {
      return await apiClient.property.createOrUpdate(
        config.azurerm_resource_group,
        config.azurerm_apim,
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
  config: IResourcesConfiguration
) => {
  winston.info("Get API management Git repository credentials");

  // Get API management configuration repository (git) credentials
  const gitKey = await apiClient.user.getSharedAccessToken(
    config.azurerm_resource_group,
    config.azurerm_apim,
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

  const changes = replaceVariables(tmpDir.name, config);
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
    config.azurerm_resource_group,
    config.azurerm_apim,
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

export const run = async (config: IResourcesConfiguration) => {
  const loginCreds = await login();

  // Needed to get storage connection string
  const apiClient = new apiManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );

  winston.info(
    "Create API management resource, this takes a while (about 30 minutes)..."
  );

  // Create API management PaaS
  const apiManagementService = await apiClient.apiManagementService.createOrUpdate(
    config.azurerm_resource_group,
    config.azurerm_apim,
    {
      location: config.location,
      notificationSenderEmail: config.apim_email,
      publisherEmail: config.apim_email,
      publisherName: config.apim_publisher,
      sku: { name: config.apim_sku, capacity: 1 }
    }
  );

  winston.info("Get Functions application key to setup API management backend");

  // Get Functions (backend) info
  // We need these to setup API operations
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds as any,
    loginCreds.subscriptionId
  );
  const { masterKey, backendUrl } = await getFunctionsInfo(
    config,
    webSiteClient
  );

  winston.info(
    "Setup Functions application key in the API management settings"
  );

  // Set up backend url and code (master key) named values
  // to access Functions endpoint in policies
  await setApimProperties(
    apiClient,
    {
      backendUrl: { secret: false, value: backendUrl },
      code: { secret: true, value: masterKey }
    },
    config
  );

  if (!apiManagementService.scmUrl) {
    throw new Error("Cannot get apiManagementService.scmUrl");
  }

  // Push configuration from local repository
  return setupConfigurationFromGit(
    apiClient,
    apiManagementService.scmUrl,
    CONFIGURATION_DIRECTORY_PATH,
    config
  );
};

checkEnvironment()
  .then(() => readConfig(process.env.ENVIRONMENT))
  .then(run)
  .then(() => winston.info("Successfully deployed API management"))
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
