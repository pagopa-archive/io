/**
 * Run this task to deploy API manager users and subscriptions.
 * ts-node apim_users.ts
 * 
 * It takes a json of user(s) data as input; see users.json.
 * 
 * This task assumes that the following resources are already created:
 *  - API Manager
 *  - API manager groups
 *  - One or more API manager product
 */
// tslint:disable:no-console
// tslint:disable:no-any

import apiManagementClient = require("azure-arm-apimanagement");
import {
  UserContract,
  UserCreateParameters
} from "azure-arm-apimanagement/lib/models";

import readConfig from "../lib/config";
const config = readConfig(__dirname + "/../tfvars.json");

import { login } from "../lib/login";

import * as fs from "fs";
import * as path from "path";

const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "users.json"), "utf8")
);

const addUserToProduct = async (
  apiClient: apiManagementClient,
  user: UserContract,
  productName: string
) => {
  const product = await apiClient.product.get(
    config.azurerm_resource_group,
    config.azurerm_apim,
    productName
  );
  if (user && user.id && product && product.id) {
    apiClient.subscription.createOrUpdate(
      config.azurerm_resource_group,
      config.azurerm_apim,
      `sid-${user.email}-${productName}`,
      {
        displayName: `sid-${user.email}-${productName}`,
        productId: product.id,
        state: "active",
        userId: user.id
      }
    );
  }
};

const createOrUpdateUser = (
  apiClient: apiManagementClient,
  user: UserCreateParameters
) =>
  apiClient.user.createOrUpdate(
    config.azurerm_resource_group,
    config.azurerm_apim,
    user.email,
    user
  );

const addUserToGroups = (
  apiClient: apiManagementClient,
  user: UserContract,
  groups: ReadonlyArray<string>
) => {
  Promise.all(
    groups.map(async group => {
      if (user && user.email) {
        return await apiClient.groupUser.create(
          config.azurerm_resource_group,
          config.azurerm_apim,
          group,
          user.email
        );
      }
      return Promise.resolve();
    })
  );
};

export const run = async () => {
  const loginCreds = await login();
  const apiClient = new apiManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );
  for (const userData of (users as any).data) {
    const user = await createOrUpdateUser(apiClient, userData);
    await addUserToGroups(apiClient, user, userData.groups);
    await addUserToProduct(apiClient, user, userData.productName);
  }
};

run()
  .then(() => console.log("successfully created/updated api manager users"))
  .catch(console.error);
