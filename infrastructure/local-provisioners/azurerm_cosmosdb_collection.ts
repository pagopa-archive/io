// tslint:disable:no-console

import * as winston from "winston";
import { login, missingLoginEnvironment } from "../../lib/login";

import CosmosDBManagementClient = require("azure-arm-cosmosdb");
import * as documentdb from "documentdb";

import yargs = require("yargs");

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

interface IRunParams {
  readonly resourceGroup: string;
  readonly cosmosdbAccountName: string;
  readonly cosmosdbDatabaseName: string;
  readonly cosmosdbCollectionName: string;
  readonly cosmosdbCollectionPartitionKey: string;
}

export const run = async (config: IRunParams) => {
  const loginResult = await login();

  const client = new CosmosDBManagementClient(
    loginResult.creds,
    loginResult.subscriptionId
  );

  const databaseAccount = await client.databaseAccounts.get(
    config.resourceGroup,
    config.cosmosdbAccountName
  );

  if (databaseAccount.documentEndpoint === undefined) {
    throw new Error("Cannot get databaseAccount.documentEndpoint");
  }

  const keys = await client.databaseAccounts.listKeys(
    config.resourceGroup,
    config.cosmosdbAccountName
  );

  const dbClient = new DocumentClient(databaseAccount.documentEndpoint, {
    masterKey: keys.primaryMasterKey
  });

  winston.info(
    `Making sure database exists: name=${config.cosmosdbDatabaseName}`
  );

  await createDatabaseIfNotExists(dbClient, config.cosmosdbDatabaseName);

  winston.info(
    `Making sure collection exists: name=${
      config.cosmosdbCollectionName
    } partitionKey=${config.cosmosdbCollectionPartitionKey}`
  );
  return createCollectionIfNotExists(
    dbClient,
    config.cosmosdbDatabaseName,
    config.cosmosdbCollectionName,
    config.cosmosdbCollectionPartitionKey
  );
};

// check whether all required environment variables are set
const missingEnvs = missingLoginEnvironment();
if (missingEnvs.length > 0) {
  console.error(`Missing required env vars: ${missingEnvs.join(", ")}`);
  process.exit(-1);
}

const argv = yargs
  .alias("g", "resource-group-name")
  .demandOption("g")
  .string("g")
  .alias("n", "cosmosdb-account-name")
  .demandOption("n")
  .string("n")
  .alias("d", "cosmosdb-documentdb-name")
  .demandOption("d")
  .string("d")
  .alias("c", "cosmosdb-collection-name")
  .demandOption("c")
  .string("c")
  .alias("k", "cosmosdb-collection-partition-key")
  .demandOption("k")
  .string("k").argv;

run({
  cosmosdbAccountName: argv.n as string,
  cosmosdbCollectionName: argv.c as string,
  cosmosdbCollectionPartitionKey: argv.k as string,
  cosmosdbDatabaseName: argv.d as string,
  resourceGroup: argv.g as string
})
  .then(() => winston.info("Completed"))
  .catch((e: Error) => winston.error(e.message));
