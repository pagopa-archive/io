/**
 * This file export a method used to parse and validate
 * the resources configuration file (from a json to a typed interface).
 */
// tslint:disable:no-any
// tslint:disable:object-literal-sort-keys

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as t from "io-ts";

import * as path from "path";
import * as readlineSync from "readline-sync";
import * as winston from "winston";

import { traverse } from "fp-ts/lib/Array";
import { Either, either, fromPredicate, left, right } from "fp-ts/lib/Either";
import { Errors, Validation } from "io-ts";
import { failure } from "io-ts/lib/PathReporter";

// read environment variables from .env file
dotenv.config();

winston.configure({
  level: process.env.VERBOSE ? "debug" : "info",
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});

// configuration file to feed terraform settings
const TF_VARS_FILE_NAME = "tfvars.json";

// Path to the directory with configuration files
export const CONF_DIR: ReadonlyArray<any> = [
  __dirname,
  "..",
  "infrastructure",
];

const Api = t.interface({
  specsPath: t.string,
  displayName: t.string,
  path: t.string
});

export const ApiDescription = t.interface({
  id: t.string,
  api: Api,
  products: t.array(t.string),
  policyFile: t.string
});

export type ApiDescription = t.TypeOf<typeof ApiDescription>;

export const ResourcesConfiguration = t.interface({
  apim_admin_email: t.string,
  apim_admin_firstname: t.string,
  apim_admin_groups: t.array(t.string),
  apim_admin_lastname: t.string,
  apim_admin_oid: t.string,
  apim_admin_product: t.string,
  apim_apis: t.array(ApiDescription),
  apim_email: t.string,
  apim_logger_id: t.string,
  apim_publisher: t.string,
  apim_scm_cred_username: t.string,
  apim_scm_username: t.string,
  azurerm_apim_sku: t.string,
  app_service_portal_git_repo: t.string,
  azurerm_adb2c_policy: t.string,
  azurerm_storage_queue_createdmessages: t.string,
  azurerm_storage_queue_emailnotifications: t.string,
  cosmosdb_failover_location: t.string,
  environment: t.string,
  location: t.string
});

export type ResourcesConfiguration = t.TypeOf<typeof ResourcesConfiguration>;

export const getObjectFromJson = <A>(
  type: t.Type<A>,
  json: t.mixed
): Either<Error, A> => {
  return type.decode(json).fold(
    // tslint:disable-next-line:readonly-array
    (l: Errors) => left(new Error(failure(l).join())),
    (r: A) => right(r)
  );
};

export const getObjectFromString = <A>(type: t.Type<A>, s: string) =>
  getObjectFromJson(type, JSON.parse(s));

// Get a typed javascript object (json) from file
export const getObjectFromFile = <A>(type: t.Type<A>, filePath: string) =>
  fromPredicate(
    (p: string) => !!fs.existsSync(p),
    p => new Error(`File ${p} not found`)
  )(filePath).chain((p: string) =>
    getObjectFromString(type, fs.readFileSync(p, "utf8"))
  );

// Get an untyped javascript object (json) from file
export const getMapFromFile = (filePath: string) =>
  getObjectFromFile(t.object, filePath);

/**
 * Merge and parses configuration files.
 * Throws an Exception and exit on any kind of error.
 */
export const readConfig = (
  environment: string,
  // tslint:disable-next-line:array-type readonly-array
  ...files: string[]
): // tslint:disable-next-line:readonly-array
Validation<ResourcesConfiguration> => {
  const config = traverse(either)(
    [
      // Get Common Terraform configuration from JSON
      path.join(...CONF_DIR, "common/variables", TF_VARS_FILE_NAME),
      // Get environment specific Terraform configuration from JSON
      path.join(...CONF_DIR, "env", environment, TF_VARS_FILE_NAME),
      ...files
    ],
    getMapFromFile
  )
    // Merge configuration files
    .fold(
      (l: Error) => {
        // exit if some error occurred trying to parse the files
        throw new Error("Error while parsing configuration files:" + l.message);
      },
      (r: ReadonlyArray<any>) =>
        r.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    );

  if (
    !process.env.NPMDEPLOY &&
    !readlineSync.keyInYNStrict(
      `Do you want to proceed with this configuration (${environment}) ?`
    )
  ) {
    throw new Error("Aborted.");
  }

  return ResourcesConfiguration.decode(config);
};
