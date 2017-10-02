/**
 * Run this task to deploy CosmoDB database and collections:
 * ts-node cosmosdb.ts
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as config from "./../tfvars.json";
import { login } from "./login";

import CosmosDBManagementClient = require("azure-arm-cosmosdb");
import * as documentdb from "documentdb";

const DocumentClient = documentdb.DocumentClient;

const collectionNotExists = (
  dbClient: documentdb.DocumentClient,
  dbName: string,
  collectionName: string
) => {
  return new Promise((resolve, reject) => {
    dbClient.readCollection(
      documentdb.UriFactory.createDocumentCollectionUri(dbName, collectionName),
      (err, coll) => {
        if (err && err.code === 404) {
          return resolve(true);
        }
        reject(coll);
      }
    );
  });
};

const databaseNotExists = (
  dbClient: documentdb.DocumentClient,
  dbName: string
) => {
  return new Promise((resolve, reject) => {
    dbClient.readDatabase(
      documentdb.UriFactory.createDatabaseUri(dbName),
      (err, db) => {
        if (err && err.code === 404) {
          return resolve(true);
        }
        reject(db);
      }
    );
  });
};

const createDatabaseIfNotExists = (
  dbClient: documentdb.DocumentClient,
  dbName: string
) => {
  return new Promise((resolve, reject) => {
    databaseNotExists(dbClient, dbName).then(
      () => {
        dbClient.createDatabase({ id: dbName }, (err, ret) => {
          if (err) {
            return reject(err);
          }
          resolve(ret);
        });
      },
      err => resolve(err)
    );
  });
};

const createCollectionIfNotExists = (
  dbClient: documentdb.DocumentClient,
  dbName: string,
  collectionName: string
) => {
  return new Promise((resolve, reject) => {
    collectionNotExists(dbClient, dbName, collectionName).then(
      () => {
        const dbUri = documentdb.UriFactory.createDatabaseUri(dbName);
        dbClient.createCollection(dbUri, { id: collectionName }, (err, ret) => {
          if (err) {
            return reject(err);
          }
          resolve(ret);
        });
      },
      err => resolve(err)
    );
  });
};

export const run = async () => {
  const loginCreds = await login();

  const client = new CosmosDBManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );

  const databaseAccount = await client.databaseAccounts.get(
    (config as any).azurerm_resource_group_00,
    (config as any).azurerm_cosmosdb_00
  );

  if (databaseAccount.documentEndpoint === undefined) {
    throw new Error("cannot get databaseAccount.documentEndpoint");
  }

  const keys = await client.databaseAccounts.listKeys(
    (config as any).azurerm_resource_group_00,
    (config as any).azurerm_cosmosdb_00
  );

  const dbClient = new DocumentClient(databaseAccount.documentEndpoint, {
    masterKey: keys.primaryMasterKey
  });

  await createDatabaseIfNotExists(
    dbClient,
    (config as any).azurerm_cosmosdb_documentdb_00
  );

  return Promise.all(
    (config as any).azurerm_cosmosdb_collections_00.map(
      async (collection: string) =>
        await createCollectionIfNotExists(
          dbClient,
          (config as any).azurerm_cosmosdb_documentdb_00,
          collection
        )
    )
  );
};

run()
  .then(() =>
    console.log("successfully deployed cosmodb database and collections")
  )
  .catch(console.error);
