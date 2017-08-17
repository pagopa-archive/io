# Playing with the API

If you want to experience API usage in a test environment,
in addition to the API documentation, you can download and use a NodeJS (express)
HTTP server which implements the APIs based on the OpenAPI specifications.

## Downloading the test environment

Start with cloning the GitHub repository:

```
git clone http://github.com/teamdigitale/cittadinanza-digitale
cd cittadinanza-digitale
npm install
```

## Starting the mock server

Type

```
npm run serve
```

to run the test environment with preloaded fixtures (ie. sample fake user data)
and a in-memory database that lets you play with the APIs.

Two HTTP server are started on differents ports: one serves the Preferences API
while the other one serves the Notifications API:

```
Serving ../docs/api/preferences.yaml API on http://localhost:10011
Serving ../docs/api/notifications-public.yaml API on http://localhost:10010
```

## Testing the APIs

Once the servers are running you can start calling the REST API methods
sending HTTP requests though a tool like [Postman](https://www.getpostman.com/).

As an alternative you may use the web gui (Swagger UI)
which starts with the API server(s):

```
Swagger UI runs at http://localhost:10011/swagger-ui
Swagger UI runs at http://localhost:10010/swagger-ui
```

## Running the documentation website locally

To run the documentation hub locally:

```
mkdocs serve to run documentation site locally
mkdocs gh-deploy to deploy docs to gh-pages
```
