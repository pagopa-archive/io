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

import * as t from "io-ts";

import { reporter } from "io-ts-reporters";

import * as winston from "winston";

import yargs = require("yargs");

import { ICreds, login } from "../../lib/login";
import { getFunctionsInfo } from "../../lib/task_utils";

import { checkEnvironment } from "../../lib/environment";

import apiManagementClient = require("azure-arm-apimanagement");
import webSiteManagementClient = require("azure-arm-website");

import * as fs from "fs";
import * as path from "path";
import * as shelljs from "shelljs";
import * as tmp from "tmp";
import * as url from "url";

import { left } from "fp-ts/lib/Either";
import * as replaceInFiles from "replace-in-file";
import {
  getObjectFromJson,
  IResourcesConfiguration,
  readConfig
} from "../../lib/config";

// tslint:disable-next-line:no-object-mutation
shelljs.config.fatal = true;
// shelljs.config.verbose = true;

const CONFIGURATION_DIRECTORY_NAME = "apim";
const CONFIGURATION_DIRECTORY_PATH = path.resolve(
  __dirname,
  `../${CONFIGURATION_DIRECTORY_NAME}`
);

/**
 * ApiParams contains the variables taken from command line (provisioner arguments)
 * that represents values that *change* between different deploying environments.
 */
const SetupOpenApiParams = t.interface({
  environment: t.string,
  apim_include_products: t.boolean,
  apim_include_policies: t.boolean,
  apim_task: t.literal("setupOpenapi")
});

const CreateApiManagementServiceParams = t.interface({
  environment: t.string,
  azurerm_apim_eventhub_connstr: t.string,
  adb2c_tenant_id: t.string,
  adb2c_portal_client_id: t.string,
  adb2c_portal_client_secret: t.string,
  apim_task: t.literal("createApiManagementService")
});

type ApimParams = t.TypeOf<typeof ApimParams>;

const ApimParams = t.union([
  SetupOpenApiParams,
  CreateApiManagementServiceParams
]);

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const setupOpenapi = (
  apiClient: apiManagementClient,
  config: IResourcesConfiguration,
  backendUrl: string,
  masterKey: string,
  includeProducts: boolean,
  includePolicies: boolean
) => {
  return Promise.all(
    config.apim_apis.map(async apiEntry => {
      const contentValue = `${backendUrl}${apiEntry.api.specsPath}?code=${
        masterKey
      }`;

      winston.info(
        `Adding API from URL: ${backendUrl}${apiEntry.api.specsPath}`
      );

      // Add API to API management
      await apiClient.api.createOrUpdate(
        config.azurerm_resource_group,
        config.azurerm_apim,
        apiEntry.id,
        {
          contentFormat: "swagger-link-json",
          contentValue,
          displayName: apiEntry.api.displayName,
          path: apiEntry.api.path,
          protocols: ["https"],
          // WARNING: serviceUrl is taken from the swagger specs "host" field
          // and there's no way to override that value here: it *must* be changed
          // manually in the API management settings
          // (or provide a real value in the swagger specs).
          serviceUrl: backendUrl
        }
      );
      // Add API to products
      if (includeProducts) {
        await Promise.all(
          apiEntry.products.map(async (product: string) => {
            winston.info(
              `Import API product into the API management: ${product}`
            );
            return apiClient.productApi.createOrUpdate(
              config.azurerm_resource_group,
              config.azurerm_apim,
              product,
              apiEntry.id
            );
          })
        );
      }
      // Add a policy to the API reading it from a file
      if (includePolicies && apiEntry.policyFile) {
        winston.info(
          `Import API policy into the API management: ${apiEntry.policyFile}`
        );
        const policyContent = fs.readFileSync(
          path.join(__dirname, "..", "api-policies", apiEntry.policyFile),
          "utf8"
        );
        await apiClient.apiPolicy.createOrUpdate(
          config.azurerm_resource_group,
          config.azurerm_apim,
          apiEntry.id,
          {
            policyContent
          },
          // If-Match: *
          "*"
        );
      }
    })
  );
};

/**
 * Setup ADB2C authentication for developer portal users.
 */
const setupAdb2c = (
  apiClient: apiManagementClient,
  config: IResourcesConfiguration,
  adb2cTenantId: string,
  adb2cClientId: string,
  adb2cClientSecret: string
) => {
  return apiClient.identityProvider.createOrUpdate(
    config.azurerm_resource_group,
    config.azurerm_apim,
    "aadB2C",
    {
      allowedTenants: [adb2cTenantId],
      clientId: adb2cClientId,
      clientSecret: adb2cClientSecret,
      identityProviderContractType: "aadB2C",
      signinPolicyName: config.azurerm_adb2c_policy,
      signupPolicyName: config.azurerm_adb2c_policy
    }
  );
};

const setupLogger = async (
  apiClient: apiManagementClient,
  config: IResourcesConfiguration,
  eventHubConnectionString: string
) => {
  winston.info("Create an EventHub logger for the API management");
  return apiClient.logger.createOrUpdate(
    config.azurerm_resource_group,
    config.azurerm_apim,
    config.apim_logger_id,
    {
      credentials: {
        connectionString: eventHubConnectionString,
        name: config.azurerm_apim_eventhub
      },
      description: "API management EventHub logger",
      loggerType: "azureEventHub"
      // We have to cast to any here because of a bug in Azure ARM EventHub API:
      // when you update (PUT) the EventHub logger you MUST provide the loggerType
    } as any
  );
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
const setupProperties = async (
  apiClient: apiManagementClient,
  config: IResourcesConfiguration,
  properties: {
    readonly [s: string]: { readonly secret: boolean; readonly value: string };
  }
) => {
  winston.info(
    "Setup Functions application key in the API management settings"
  );
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

const getPropsFromFunctions = async (
  loginCreds: ICreds,
  config: IResourcesConfiguration
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
    config.azurerm_resource_group,
    config.azurerm_functionapp
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
  config: IResourcesConfiguration
) => {
  winston.info(
    "Create API management resource, this takes a while (about 30 minutes)..."
  );
  const apiManagementService = await apiClient.apiManagementService.createOrUpdate(
    config.azurerm_resource_group,
    config.azurerm_apim,
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
  const config = readConfig(params.environment).fold(errs => {
    throw new Error(
      "Error parsing configuration:\n\n" + reporter(left(errs) as any)
    );
  }, t.identity);

  const loginCreds = await login();

  // Needed to get storage connection string
  const apiClient = new apiManagementClient(
    loginCreds.creds,
    loginCreds.subscriptionId
  );

  const functionProperties = await getPropsFromFunctions(loginCreds, config);

  // Set up backend url and code (master key) named values
  // to access Functions endpoint in policies

  switch (params.apim_task) {
    case "createApiManagementService":
      const apiManagementService = await createOrUpdateApiManagementService(
        apiClient,
        config
      );
      if (!apiManagementService.scmUrl) {
        throw new Error("Cannot get apiManagementService.scmUrl");
      }
      await setupProperties(apiClient, config, functionProperties);
      // Push API management configuration from local repository
      await setupConfigurationFromGit(
        apiClient,
        apiManagementService.scmUrl,
        CONFIGURATION_DIRECTORY_PATH,
        config
      );
      // Set up EventHub logging
      await setupLogger(
        apiClient,
        config,
        params.azurerm_apim_eventhub_connstr
      );
      // Allow access to developer portal through ADB2C
      await setupAdb2c(
        apiClient,
        config,
        params.adb2c_tenant_id,
        params.adb2c_portal_client_id,
        params.adb2c_portal_client_secret
      );
      break;
    case "setupOpenapi":
      // Setup OpenAPI from swagger specs
      await setupOpenapi(
        apiClient,
        config,
        functionProperties.backendUrl.value,
        functionProperties.code.value,
        params.apim_include_products,
        params.apim_include_policies
      );
      break;
    // default:
    //   const _: never = params;
  }
};

const argv = yargs
  .option("environment", {
    demandOption: true,
    string: true
  })
  .option("apim_include_policies", {
    boolean: true
  })
  .option("apim_include_products", {
    boolean: true
  })
  .option("azurerm_apim_eventhub_connstr", {
    string: true
  })
  .option("adb2c_tenant_id", {
    string: true
  })
  .option("adb2c_portal_client_id", {
    string: true
  })
  .option("adb2c_portal_client_secret", {
    string: true
  })
  .option("apim_task", {
    demandOption: true,
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
