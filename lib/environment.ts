export const checkEnvironment = (): Promise<void> => {
  const emptyVars = [
    "ENVIRONMENT",
    "TF_VAR_ADB2C_TENANT_ID",
    "ARM_SUBSCRIPTION_ID",
    "ARM_CLIENT_ID",
    "ARM_CLIENT_SECRET",
    "ARM_TENANT_ID",
    "TF_VAR_DEV_PORTAL_CLIENT_ID",
    "TF_VAR_DEV_PORTAL_CLIENT_SECRET",
    "DEV_PORTAL_EXT_CLIENT_ID",
    "DEV_PORTAL_EXT_CLIENT_SECRET"
  ]
    .map(envName => process.env[envName])
    .filter(v => v === undefined || v === null || v === "");
  return !emptyVars.length
    ? Promise.resolve()
    : Promise.reject(
        new Error(
          "Set up the following environment variables: " + emptyVars.join(",")
        )
      );
};
