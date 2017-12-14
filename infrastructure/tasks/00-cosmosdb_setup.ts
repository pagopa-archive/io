/**
 * Run this task to deploy CosmoDB database and collections:
 *
 * yarn resources:cosmosdb:setup
 *
 * This task assumes that the following resources are already created:
 *  - Resource group
 *  - CosmoDB database account
 */
// tslint:disable:no-console
// tslint:disable:no-any

import * as winston from "winston";
import { login } from "../../lib/login";

import { IResourcesConfiguration, readConfig } from "../../lib/config";
import { checkEnvironment } from "../../lib/environment";

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
  collectionName: string,
  partitionKey: string
) => {
  winston.info(
    `Create CosmosDB collection ${collectionName} with partitionKey ${
      partitionKey
    }`
  );
  return new Promise((resolve, reject) => {
    collectionNotExists(dbClient, dbName, collectionName).then(
      () => {
        const dbUri = documentdb.UriFactory.createDatabaseUri(dbName);
        dbClient.createCollection(
          dbUri,
          {
            id: collectionName,
            partitionKey: {
              kind: "Hash",
              paths: [`/${partitionKey}`]
            }
          },
          (err, ret) => {
            if (err) {
              return reject(err);
            }
            resolve(ret);
          }
        );
      },
      err => resolve(err)
    );
  });
};

export const run = async (config: IResourcesConfiguration) => {
  const loginCreds = await login();

  const client = new CosmosDBManagementClient(
    (loginCreds as any).creds,
    loginCreds.subscriptionId
  );

  const databaseAccount = await client.databaseAccounts.get(
    config.azurerm_resource_group,
    config.azurerm_cosmosdb
  );

  if (databaseAccount.documentEndpoint === undefined) {
    throw new Error("Cannot get databaseAccount.documentEndpoint");
  }

  const keys = await client.databaseAccounts.listKeys(
    config.azurerm_resource_group,
    config.azurerm_cosmosdb
  );

  const dbClient = new DocumentClient(databaseAccount.documentEndpoint, {
    masterKey: keys.primaryMasterKey
  });

  winston.info("Setup CosmosDB database");

  await createDatabaseIfNotExists(dbClient, config.azurerm_cosmosdb_documentdb);

  return Promise.all(
    config.azurerm_cosmosdb_collections.map(
      async collection =>
        await createCollectionIfNotExists(
          dbClient,
          config.azurerm_cosmosdb_documentdb,
          collection.name,
          collection.partitionKey
        )
    )
  );
};

checkEnvironment()
  .then(() => readConfig(process.env.ENVIRONMENT))
  .then(run)
  .then(() =>
    winston.info("Successfully deployed CosmosDB database and collections")
  )
  .catch((e: Error) => console.error(process.env.VERBOSE ? e : e.message));
