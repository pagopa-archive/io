/**
 * Creates a new Service tied to the user subscription
 * in the API management resource.
 */
// tslint:disable:no-console

import { isLeft } from "fp-ts/lib/Either";
import { isNone } from "fp-ts/lib/Option";

import { NonEmptyString } from "digital-citizenship-functions/lib/utils/strings";

import * as t from "io-ts";

const toNonEmptyString = (s: string) =>
  t.validate(s, NonEmptyString).toOption();

import {
  IService,
  ServiceModel,
  toAuthorizedCIDRs,
  toAuthorizedRecipients
} from "digital-citizenship-functions/lib/models/service";

import * as documentDbUtils from "digital-citizenship-functions/lib/utils/documentdb";
import { DocumentClient as DocumentDBClient } from "documentdb";

export interface IServicePayload {
  readonly service_name: string;
  readonly department_name: string;
  readonly organization_name: string;
  readonly service_id: string;
  readonly authorized_recipients: ReadonlyArray<string>;
  readonly authorized_cidrs: ReadonlyArray<string>;
}

const toIService = (servicePayload: IServicePayload): IService => {
  const defaultString = toNonEmptyString("default");
  if (isNone(defaultString)) {
    throw new Error("Empty default string");
  }
  return {
    authorizedCIDRs: toAuthorizedCIDRs(servicePayload.authorized_cidrs),
    authorizedRecipients: toAuthorizedRecipients(
      servicePayload.authorized_recipients
    ),
    departmentName: toNonEmptyString(
      servicePayload.department_name
    ).getOrElseValue(defaultString.value),
    organizationName: toNonEmptyString(
      servicePayload.organization_name
    ).getOrElseValue(defaultString.value),
    serviceId: toNonEmptyString(servicePayload.service_id).getOrElseValue(
      defaultString.value
    ),
    serviceName: toNonEmptyString(servicePayload.service_name).getOrElseValue(
      defaultString.value
    )
  };
};

export const getServiceModel = (
  cosmosDbUri: string,
  cosmosDbKey: string,
  cosmosDbName: string
) => {
  const maybeCosmosDbName = toNonEmptyString(cosmosDbName);
  if (isNone(maybeCosmosDbName)) {
    throw new Error("Cannot get CosmosDB name");
  }
  const documentDbDatabaseUrl = documentDbUtils.getDatabaseUri(
    maybeCosmosDbName.value
  );
  const servicesCollectionUrl = documentDbUtils.getCollectionUri(
    documentDbDatabaseUrl,
    "services"
  );
  const documentClient = new DocumentDBClient(cosmosDbUri, {
    masterKey: cosmosDbKey
  });
  return new ServiceModel(documentClient, servicesCollectionUrl);
};

export const createOrUpdateService = async (
  serviceId: string,
  serviceModelPayload: IServicePayload,
  serviceModel: ServiceModel
) => {
  const iService = toIService(serviceModelPayload);
  const maybeServiceId = toNonEmptyString(serviceId);
  if (isNone(maybeServiceId)) {
    throw new Error("Empty serviceId");
  }
  const errorOrMaybeService = await serviceModel.findOneByServiceId(
    maybeServiceId.value
  );
  if (isLeft(errorOrMaybeService)) {
    throw new Error(
      `Error in findOneByServiceId(): ${errorOrMaybeService.value
        .code}:${errorOrMaybeService.value.body}`
    );
  }
  const maybeService = errorOrMaybeService.value;
  if (isNone(maybeService)) {
    console.log(iService);
    // no service found, try to create one
    const errorOrService = await serviceModel.create(
      iService,
      iService.serviceId
    );
    if (isLeft(errorOrService)) {
      throw new Error(
        `Error in serviceModel.create(), check CosmosDB firewall rules: ${errorOrService
          .value.code}:${errorOrService.value.body}`
      );
    }
    return errorOrService.value;
  } else {
    // try to update existing service
    const existingService = maybeService.value;
    const errorOrMaybeUpdatedService = await serviceModel.update(
      existingService.id,
      existingService.serviceId,
      currentService => {
        const updatedService = {
          ...currentService,
          ...iService,
          serviceId: maybeServiceId.value
        };
        return updatedService;
      }
    );
    if (isLeft(errorOrMaybeUpdatedService)) {
      throw new Error(
        `Error in serviceModel.update(), check CosmosDB firewall rules: ${errorOrMaybeUpdatedService
          .value.code}:${errorOrMaybeUpdatedService.value.body}`
      );
    } else {
      const maybeUpdatedService = errorOrMaybeUpdatedService.value;
      if (isNone(maybeUpdatedService)) {
        throw new Error("Cannot find updated service.");
      }
      return maybeUpdatedService.value;
    }
  }
};
