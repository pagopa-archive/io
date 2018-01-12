import * as msRest from "ms-rest";
import * as msRestAzure from "ms-rest-azure";

process.on("unhandledRejection", console.error);

export interface ICreds {
  readonly creds: msRest.ServiceClientCredentials;
  readonly subscriptionId: string;
}

/**
 * Returns required env vars for logging in to Azure that are either undefined
 * or empty.
 */
const missingLoginEnvironment = (): ReadonlyArray<string> =>
  [
    "ARM_SUBSCRIPTION_ID",
    "ARM_CLIENT_ID",
    "ARM_CLIENT_SECRET",
    "ARM_TENANT_ID"
  ].filter(e => process.env[e] === undefined || process.env[e] === "");

export const login = (): Promise<ICreds> =>
  new Promise((resolve, reject) => {
    const missingEnvs = missingLoginEnvironment();
    if (missingEnvs.length > 0) {
      return reject(`Missing required env vars: ${missingEnvs.join(", ")}`);
    }

    const clientId = process.env.ARM_CLIENT_ID;
    const secret = process.env.ARM_CLIENT_SECRET;
    const domain = process.env.ARM_TENANT_ID;
    const subscriptionId = process.env.ARM_SUBSCRIPTION_ID;

    msRestAzure.loginWithServicePrincipalSecret(
      clientId,
      secret,
      domain,
      {},
      (err, creds) => {
        if (err) {
          return reject(err);
        }
        resolve({ creds, subscriptionId });
      }
    );
  });
