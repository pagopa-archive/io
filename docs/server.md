# Playing with the API

If you want to experience API usage in a test environment,
in addition to the API documentation, you can download and use a NodeJS (express)
HTTP server which implements the APIs based on the OpenAPI specifications.

## Downloading the test environment

Start cloning the GitHub repository:

`git clone http://github.com/teamdigitale/cittadinanza-digitale`
`cd cittadinanza-digitale`
`npm install`

## Starting the mock server

Type

`npm run serve`

to run the test environment with preloaded fixtures (ie. sample fake user data)
and a in-memory database that lets you play with the APIs.

Two HTTP server are started on differents ports: one serves the Preferences API
while the other one serves the Notifications API.

## Calling the APIs

Once the servers are running you can start calling the remote (HTTP) API methods
though a tool like [Postman](https://www.getpostman.com/) or with the help of
the embedded interface (swagger-editor):

`npm run edit`

## Running the documentation website locally

To run the documentation hub locally:

`mkdocs serve` to run documentation site locally
`mkdocs gh-deploy` to deploy docs to gh-pages
