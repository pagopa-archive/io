import * as msRest from "ms-rest";
import * as msRestAzure from "ms-rest-azure";

process.on("unhandledRejection", console.error);

export interface ICreds {
  readonly creds: msRest.ServiceClientCredentials;
  readonly subscriptionId: string;
}

export const login = (
  opts: msRestAzure.AzureTokenCredentialsOptions = {},
  clientId = process.env.ARM_CLIENT_ID,
  secret = process.env.ARM_CLIENT_SECRET,
  domain = process.env.ARM_TENANT_ID,
  subscriptionId = process.env.ARM_SUBSCRIPTION_ID
): Promise<ICreds> =>
  new Promise((resolve, reject) => {
    msRestAzure.loginWithServicePrincipalSecret(
      clientId,
      secret,
      domain,
      opts,
      (err, creds) => {
        if (err) {
          return reject(err);
        }
        resolve({ creds, subscriptionId });
      }
    );
  });
