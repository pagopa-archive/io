'use strict'

const JsonRefs = require('json-refs')
const YAML = require('js-yaml')
const SwaggerExpress = require('swagger-express-mw')
const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath()

const express = require('express')
const app = express()

const fixtures = require('./fixtures')
fixtures.insert()

const SWAGGER_UI_PATH = '/swagger-ui'
const DEFAULT_API_PORT = 8081

const APIs = [
  '../docs/api/notifications-public.yaml',
  '../docs/api/preferences.yaml'
]

const promises = APIs.map(
  api =>
    new Promise(function(resolve, reject) {
      JsonRefs.resolveRefsAt(api, {
        // Resolve all remote references
        filter: ['relative', 'remote'],
        loaderOptions: {
          processContent: (res, cb) => cb(undefined, YAML.safeLoad(res.text))
        }
      })
        .then(results => {
          const config = {
            appRoot: __dirname,
            swagger: results.resolved
            // swaggerFile: `${__dirname}/api/file.yaml`
          }

          const host = results.resolved.host

          const port =
            host && host.indexOf(':')
              ? parseInt(results.resolved.host.split(':')[1])
              : DEFAULT_API_PORT

          SwaggerExpress.create(config, function(err, swaggerExpress) {
            if (err) {
              reject(err)
            }

            app.use(SWAGGER_UI_PATH, express.static(swaggerUiAssetPath))

            // install middleware
            swaggerExpress.register(app)

            // @see https://github.com/theganyo/swagger-node-runner/releases/tag/v0.6.4
            swaggerExpress.runner.on(
              'responseValidationError',
              (validationResponse, req, res) => {
                console.dir(validationResponse.errors, { depth: 4 })
                res.status(500).json(validationResponse)
              }
            )

            app.listen(port, function() {
              console.log('Serving %s API on http://localhost:%d', api, port)
              console.log(
                'Swagger UI runs at http://localhost:%d%s',
                port,
                SWAGGER_UI_PATH
              )
              resolve(app)
            })
          })
        })
        .catch(function(err) {
          console.error(err.stack)
          process.exit(1)
        })
    })
)

module.exports = Promise.all(promises)
