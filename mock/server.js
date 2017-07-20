'use strict'

const JsonRefs = require('json-refs')
const YAML = require('js-yaml')
const SwaggerExpress = require('swagger-express-mw')
const app = require('express')()

const fixtures = require('./fixtures')
fixtures.insert()

const APIs = [
  {
    yaml: '../docs/api/notifications-public.yaml',
    port: 10010
  },
  {
    yaml: '../docs/api/preferences.yaml',
    port: 10011
  }
]

const promises = APIs.map(
  api =>
    new Promise(function(resolve, reject) {
      JsonRefs.resolveRefsAt(api.yaml, {
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

          SwaggerExpress.create(config, function(err, swaggerExpress) {
            if (err) {
              reject(err)
            }

            // If you want to use swaggerUI uncomment these lines
            //
            // Sway.create({ definition: './api/swagger/swagger.yaml' }).then(
            //   function(swaggerApi) {
            //     app.use(new SwaggerUi(swaggerApi.resolved))
            //   },
            //   function(err) {
            //     console.error(err.stack)
            //     process.exit(1)
            //   }
            // )

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

            app.listen(api.port, function() {
              console.log('Serving %s API on port %d', api.yaml, api.port)
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
