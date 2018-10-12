import { CollectionMeta, DocumentClient, UriFactory } from "documentdb";
import { Either, left, right } from "fp-ts/lib/Either";
import * as t from "io-ts";
import * as winston from "winston";
import yargs = require("yargs");
import { getObjectFromJson } from "../../lib/config";
import { checkEnvironment } from "../../lib/environment";

const TaskParams = t.interface({
  azurerm_cosmosdb: t.string,
  azurerm_cosmosdb_collection: t.string,
  azurerm_cosmosdb_collection_pk: t.string,
  azurerm_cosmosdb_key: t.string,
  azurerm_documentdb: t.string,
  azurerm_resource_group: t.string
});
export type TaskParams = t.TypeOf<typeof TaskParams>;

function createCollection(
  dbClient: DocumentClient,
  params: TaskParams
): Promise<Either<Error, CollectionMeta>> {
  winston.info(
    `Create CosmosDB collection ${
      params.azurerm_cosmosdb_collection
    } with partitionKey ${params.azurerm_cosmosdb_collection_pk}`
  );
  return new Promise(resolve => {
    const dbUri = UriFactory.createDatabaseUri(params.azurerm_documentdb);
    dbClient.createCollection(
      dbUri,
      {
        id: params.azurerm_cosmosdb_collection,
        partitionKey: {
          kind: "Hash",
          paths: [`/${params.azurerm_cosmosdb_collection_pk}`]
        }
      },
      (err, ret) => {
        if (err) {
          return resolve(left<Error, CollectionMeta>(new Error(err.body)));
        }
        resolve(right<Error, CollectionMeta>(ret));
      }
    );
  });
}

export const run = async (params: TaskParams) => {
  const cosmosdbLink = `https://${
    params.azurerm_cosmosdb
  }.documents.azure.com:443/`;
  const cosmosdbKey = params.azurerm_cosmosdb_key;
  winston.info(`Using CosmosDB url ${cosmosdbLink}`);
  const cosmosdbClient = new DocumentClient(cosmosdbLink, {
    masterKey: cosmosdbKey
  });
  (await createCollection(cosmosdbClient, params)).mapLeft(err =>
    winston.error(err.message)
  );
};

const argv = yargs
  .option("azurerm_resource_group", {
    string: true
  })
  .option("azurerm_documentdb", {
    string: true
  })
  .option("azurerm_cosmosdb", {
    string: true
  })
  .option("azurerm_cosmosdb_key", {
    string: true
  })
  .option("azurerm_cosmosdb_collection", {
    string: true
  })
  .option("azurerm_cosmosdb_collection_pk", {
    string: true
  })
  .help().argv;

checkEnvironment()
  .then(() => getObjectFromJson(TaskParams, argv))
  .then(e =>
    e.map(run).mapLeft(err => {
      throw err;
    })
  )
  .then(() => winston.info("Completed"))
  .catch((e: Error) => winston.error(e.message));
