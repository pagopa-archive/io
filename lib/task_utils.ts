import * as request from "request";
import * as url from "url";

import { IResourcesConfiguration } from "./config";

import webSiteManagementClient = require("azure-arm-website");

/**
 * Get Functions (app service) backend URL and master key
 * to set up API manager properties (backend).
 */
export const getFunctionsInfo = async (
  config: IResourcesConfiguration,
  webClient: webSiteManagementClient
) => {
  const functions = await webClient.webApps.get(
    config.azurerm_resource_group,
    config.azurerm_functionapp
  );
  const creds = await webClient.webApps.listPublishingCredentials(
    config.azurerm_resource_group,
    config.azurerm_functionapp
  );
  const backendUrl = `https://${functions.defaultHostName}`;

  // @FIXME: unfortunately there is no API to get a Functions App master key
  const secretUrl = url.format({
    auth: `${creds.publishingUserName}:${creds.publishingPassword}`,
    host: `${config.azurerm_functionapp}.scm.azurewebsites.net`,
    pathname: "/api/functions/admin/masterkey",
    protocol: "https"
  });

  const masterKey = await new Promise<string>((resolve, reject) =>
    request.get(secretUrl, (err, __, body) => {
      if (err) {
        return reject(err);
      }
      resolve(JSON.parse(body).masterKey);
    })
  );
  return { masterKey, backendUrl };
};
