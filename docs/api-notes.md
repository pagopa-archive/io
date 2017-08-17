# API notes

Notes about the APIs and OpenAPI / Swagger mocking.

## User’s preferences

### SCIM

SCIM is a REST/API protocol for user provisioning:  
[*http://www.simplecloud.info/*](http://www.simplecloud.info/)

Producing a SCIM-compatbile API for user's preferences COULD
bring some advantages.

### What problems SCIM solves

- Resources’ Schema extensions (custom attributes)
- Bulk operations (CRUD)
- Search and fields filtering and sorting
- Common User schema (w/SAML)
- Users groups (schema)
- Interoperable implementations (client and server)

### SCIM References

[*https://tools.ietf.org/html/rfc7643*](https://tools.ietf.org/html/rfc7643)  
[*https://tools.ietf.org/html/rfc7644*](https://tools.ietf.org/html/rfc7644)  
[*https://tools.ietf.org/html/rfc7642*](https://tools.ietf.org/html/rfc7642)  

User preferences activity feed (changelog):  
[*https://tools.ietf.org/html/draft-hunt-scim-notify-00*](https://tools.ietf.org/html/draft-hunt-scim-notify-00)

Activity feed reference implementation:  
[*https://github.com/jirmauritz/scim-notification-hub*](https://github.com/jirmauritz/scim-notification-hub)

#### Who uses SCIM

- [*Facebook*](https://developers.facebook.com/docs/workplace/account-management/api)
- [*Oracle*](https://docs.oracle.com/cd/E52734_01/oim/OMDEV/scim.htm#OMDEV5526)
- [*CloudFoundry*](https://docs.cloudfoundry.org/adminguide/uaa-user-management.html)
- [*Slack*](https://api.slack.com/scim)
- [*Trello*](https://developers.trello.com/advanced-reference/scim)
- [*GitHub*](https://developer.github.com/v3/scim/)
- [*Microsoft*](https://docs.microsoft.com/it-it/azure/active-directory/active-directory-scim-provisioning)

#### “Ready made” implementations

[*http://www.simplecloud.info/\#implementations*](http://www.simplecloud.info/#implementations)

|                       |  **WSO2**   |   **OSIAM**    |  **Gluu**    |
| ----------------------|:-----------:|---------------:|--------------|
|  **Maturity**         |  \*\*\*\*   |  \*            | \*\*\*       |
|  **Project activity** |  \*\*\*     |  \*            | \*\*\*       |
|  **Documentation**    |  \*\*\*     |  \*            | \*\*\*       |

##### WSO2 + charon

[*https://github.com/wso2/charon*](https://github.com/wso2/charon)

- current stable version (wso2 charon 2.1.0) does not support filters (user search) other than ‘Eq’

- charon 3.x filtering is much more useful but maven archives has only 2.x:     [*https://mvnrepository.com/artifact/org.wso2.charon/org.wso2.charon.core*](https://mvnrepository.com/artifact/org.wso2.charon/org.wso2.charon.core)

- wso2 charon 3.x much more useful as library but you you have to provide the API layer and the persistence layer (UserManager) by yourself

- missing docs about adding custom attributes

##### OSIAM

[*https://github.com/osiam/osiam*](https://github.com/osiam/osiam)

- very poor documentation

- very low activity in the last year

- SCIM bulk actions not yet implemented

- OSIAM does not yet support complex data types for extensions. According to docs "The absence of this feature will be addressed in a future version"

##### Gluu

[*https://www.gluu.org/gluu-server/*](https://www.gluu.org/gluu-server/)

- looks very good but cannot install on small vm

## Notifications API

### Existing APIs for messaging

- [*https://firebase.google.com/docs/cloud-messaging/send-message*](https://firebase.google.com/docs/cloud-messaging/send-message)

-   [*https://github.com/alphagov/notifications-api*](https://github.com/alphagov/notifications-api)

-   [*https://docs.nylas.com/reference*](https://docs.nylas.com/reference)

-   [*https://www.mailgun.com/*](https://www.mailgun.com/)

-   [*https://context.io/*](https://context.io/)

### Handling subscriptions (opt-in / opt-out)

To store subscriptions data (opt-in / opt-out) we can associate a
blacklist for every user in the system.

If we use SCIM we MUST add an extension to the SCIM core schema.

```
optOut: [
{
  organization_id: <id>,
  topics: [ t1, t2, ... ]
}]
```

where *organization_id* is the identifier of the senders blocked by
users for some specific topics.

## OpenAPIs mocking

### swaggerize

[https://github.com/krakenjs/swaggerize-express](https://github.com/krakenjs/swaggerize-express)

Mocks come from “swagmock”, but only this fork of swagmock:
[*https://github.com/fhoek/swagmock*](https://github.com/fhoek/swagmock)
supports "*allOf*" OpenAPI operator, so you MUST use this version and
not the one that comes from the original package.json in order to make it work:

```
cat users.json |sed -e 's/faker/x\\-faker/' &gt; .tmp && mv .tmp users.json
npm install --save https://github.com/fhoek/swagmock
```

### json-schema-faker

[https://github.com/json-schema-faker/json-schema-faker](https://github.com/json-schema-faker/json-schema-faker)

Supports swagger format and generates 1 json with fake data for each endpoint

You can use it directly with
[*https://www.npmjs.com/package/swagger-routes*](https://www.npmjs.com/package/swagger-routes)

without using swaggerize.

### swagger-node

Based on [sway](https://github.com/apigee-127/sway) AND [swagger-tools](https://github.com/apigee-127/swagger-tools).

Sway (aside sway-connect middleware) was supposed to supersede swagger-tools,
but has it lacks feature parity (and a good documentation), swagger-node falls back
to swagger-tools for some tasks (mostly, validation).

If you want to use it in mock mode you MUST add for every path the directive:

```
"x-swagger-router-controller": "controllerName"
```

see
[*https://github.com/swagger-api/swagger-node/issues/342*](https://github.com/swagger-api/swagger-node/issues/342)

swagger-node can emit some fake data (simple strings), but you can write custom controllers to mock it.
This activity is **mandatory** whenever there is a validation on the field format (ie. an email field)
otherwise the response object will fail validation (when responses validation is on).

swagger-node (swagger-tools) makes use of [bagpipes](https://github.com/apigee-127/bagpipes), a weird
framework to code in YAML things you'd better write in Javascript.

There are a lot of gotchas using swagger-node and the documentation is poor.

As [swagger-tools](https://github.com/apigee-127/swagger-tools) swagger-node seems **deprecated / unmantained**:  
https://github.com/apigee-127/swagger-tools/issues/335.

It does not support [$ref to relative path](https://github.com/apigee-127/swagger-tools/issues/227),
so you MUST use [json-refs](https://github.com/whitlockjc/json-refs) to resolve them
before plugging the express middleware.

If you have multiple spec files, you MUST start one HTTP (API) server for each one
or using different mount points, see https://github.com/apigee-127/swagger-tools/issues/126.

To change default location of spec files (```api/swagger/swagger.yaml```) you MUST set an
environment variable before running the swagger cli, see https://github.com/swagger-api/swagger-node/issues/373.

Swagger Editor 3.x (the tool that starts executing `swagger project edit`) does not support
$references to local files (see https://github.com/swagger-api/swagger-editor/issues/1409). The older 2.x
release supports them, but you MUST set the configuration option `pointerResolutionBasePath` eventually through
the environment variable `swagger_swagger_editorConfig_pointerResolutionBasePath`.

To handle validation of responses you MUST set a NodeJS listener on the swagger-node-runner
before starting the server, see https://github.com/theganyo/swagger-node-runner/releases/tag/v0.6.4
for a working example.

### swagger-codegen

[*https://github.com/swagger-api/swagger-codegen*](https://github.com/swagger-api/swagger-codegen)

Needs java + maven. Does not generate mock data.

Uses swagger-tools which, when used standalone, remove the
need to compile the java version of swagger-codegen: see
[*https://github.com/apigee-127/swagger-tools/blob/master/docs/QuickStart.md*](https://github.com/apigee-127/swagger-tools/blob/master/docs/QuickStart.md)

You'd better start with swagger-tools or swagger-node directly.

### swagger-tools

swagger-node uses swagger-tools to set up its server.
Anyway, swagger-tools can be used standalone (without the bagpipes boilerplate):

https://github.com/apigee-127/swagger-tools/blob/master/docs/QuickStart.md

### swagger-express-middleware

https://github.com/BigstickCarpet/swagger-express-middleware

Is a modern (unofficial) version of swagger-tools for express
(while swagger-tools are targeted as a connect middleware).

The project seems better maintained and popular than swagger-tools (~300k downloads on npm).
It lacks the routing middleware (so you have to use it with something like [swagger-routes](https://www.npmjs.com/package/swagger-routes)).

It has an in-memory database to test mocked resources.

### swagger-server

Uses swagger-express-middleware to implement a server (like swagger-node does with swagger-tools).
It provides the express routing middleware that swagger-express-middleware lacks.

### loopback-swagger-generator

https://loopback.io/doc/en/lb3/Swagger-generator.html

Generates routes and models (for persistence) from swagger specs.

### Prism

[*http://stoplight.io/platform/prism/*](http://stoplight.io/platform/prism/)

It’s a free mock Swagger server from Spotlight.io. The bad part is you
MUST embed some javascript code inside the Swagger specs to customize
controllers, which is not ideal.

## Guidelines

[*https://zalando.github.io/restful-api-guidelines*](https://zalando.github.io/restful-api-guidelines)

-   Secure Endpoints with OAuth 2.0
-   Define and Assign Access Rights (Scopes)
-   Use
    > [*x-extensible-enum*](https://zalando.github.io/restful-api-guidelines/compatibility/Compatibility.html#should-used-openended-list-of-values-xextensibleenum-instead-of-enumerations)
    > (and string types)
-   Consider using ETag together with If-(None-)Match header
-   Always return Location header for POST
-   Pluralize Resource Names
-   Always Return JSON Objects As Top-Level Data Structures To Support
    > Extensibility
-   Use Problem JSON
    > [*https://zalando.github.io/problem/schema.yaml*](https://zalando.github.io/problem/schema.yaml)
-   [*https://en.wikipedia.org/wiki/List\_of\_ISO\_639-1\_codes*](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
-   Use /api as first Path Segment
-   Empty array values should not be null
-   Boolean property values must not be null
-   ...
