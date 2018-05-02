/**
 * This task deploys Azure API Management OpenAPI.
 *
 * This task assumes that the following resources are already created:
 *  - Resource group
 *  - Functions (app service)
 *  - API management resource
 *
 * Unfortunately you cannot migrate Widgets and Media Libray:
 * https://{publisherPortalName}.portal.azure-api.net/Admin/Widgets
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as fs from "fs";
import * as t from "io-ts";
import * as path from "path";
import * as winston from "winston";

import apiManagementClient from "azure-arm-apimanagement";
import webSiteManagementClient = require("azure-arm-website");
import yargs = require("yargs");

import { left } from "fp-ts/lib/Either";
import { reporter } from "io-ts-reporters";
import { checkEnvironment } from "../../lib/environment";
import { ICreds, login } from "../../lib/login";

import {
  CONF_DIR,
  getObjectFromJson,
  readConfig,
  ResourcesConfiguration
} from "../../lib/config";
import { getFunctionsInfo } from "../../lib/task_utils";

/**
 * ApiParams contains the variables taken from command line (provisioner arguments)
 * that represents values that *change* between different deploying environments.
 */
const ApimParams = t.interface({
  apim_configuration_path: t.string,
  apim_include_policies: t.boolean,
  apim_include_products: t.boolean,
  azurerm_apim: t.string,
  azurerm_functionapp: t.string,
  azurerm_resource_group: t.string,
  environment: t.string
});

type ApimParams = t.TypeOf<typeof ApimParams>;

const getPropsFromFunctions = async (
  loginCreds: ICreds,
  params: ApimParams
) => {
  winston.info("Get Functions application key and backend URL");

  // Get Functions (backend) info
  // We need these to setup API operations
  const webSiteClient = new webSiteManagementClient(
    loginCreds.creds,
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

const setupOpenapi = (
  apiClient: apiManagementClient,
  config: ResourcesConfiguration,
  backendUrl: string,
  masterKey: string,
  params: ApimParams
) => {
  return Promise.all(
    config.apim_apis.map(async apiEntry => {
      const contentValue = `${backendUrl}${
        apiEntry.api.specsPath
      }?code=${masterKey}`;

      winston.info(
        `Adding API from URL: ${backendUrl}${apiEntry.api.specsPath}`
      );

      // Add API to API management
      await apiClient.api.createOrUpdate(
        params.azurerm_resource_group,
        params.azurerm_apim,
        apiEntry.id,
        {
          contentFormat: "swagger-link-json",
          contentValue,
          displayName: apiEntry.api.displayName,
          path: apiEntry.api.path,
          protocols: ["https"],
          serviceUrl: backendUrl
        }
      );
      // Add API to products
      if (params.apim_include_products) {
        await Promise.all(
          apiEntry.products.map(async (product: string) => {
            winston.info(
              `Import API product into the API management: ${product}`
            );
            return apiClient.productApi.createOrUpdate(
              params.azurerm_resource_group,
              params.azurerm_apim,
              product,
              apiEntry.id
            );
          })
        );
      } else {
        winston.warn(
          "To import API products set the command line flag 'apim_include_products'"
        );
      }
      // Add a policy to the API reading it from a file
      if (params.apim_include_policies && apiEntry.policyFile) {
        winston.info(
          `Import API policy into the API management: ${apiEntry.policyFile}`
        );
        const policyContent = fs.readFileSync(
          path.join(__dirname, "..", "api-policies", apiEntry.policyFile),
          "utf8"
        );
        await apiClient.apiPolicy.createOrUpdate(
          params.azurerm_resource_group,
          params.azurerm_apim,
          apiEntry.id,
          {
            policyContent
          },
          {
            ifMatch: "*"
          }
        );
      } else {
        winston.warn(
          "To import API policies set the command line flag 'apim_include_policies'"
        );
      }
    })
  );
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

  const apiClient = new apiManagementClient(
    loginCreds.creds,
    loginCreds.subscriptionId
  );

  const functionProperties = await getPropsFromFunctions(loginCreds, params);

  await setupOpenapi(
    apiClient,
    config,
    functionProperties.backendUrl.value,
    functionProperties.code.value,
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
  .option("apim_include_policies", {
    boolean: true
  })
  .option("apim_include_products", {
    boolean: true
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
