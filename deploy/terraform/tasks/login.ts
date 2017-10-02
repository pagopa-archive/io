import * as msRest from "ms-rest";
import * as msRestAzure from "ms-rest-azure";

const clientId = process.env.ARM_CLIENT_ID;
const secret = process.env.ARM_CLIENT_SECRET;
const domain = process.env.ARM_TENANT_ID;
const subscriptionId = process.env.ARM_SUBSCRIPTION_ID;

process.on("unhandledRejection", console.error);

interface ICreds {
  readonly creds: msRest.ServiceClientCredentials;
  readonly subscriptionId: string;
}

export const login = (): Promise<ICreds> =>
  new Promise((resolve, reject) => {
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
