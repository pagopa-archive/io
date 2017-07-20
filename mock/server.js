'use strict'

const JsonRefs = require('json-refs')
const YAML = require('js-yaml')
const SwaggerExpress = require('swagger-express-mw')
const app = require('express')()

const fixtures = require('./fixtures')
fixtures.insert()

// @todo get port from specs
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
              : null

          SwaggerExpress.create(config, function(err, swaggerExpress) {
            if (err) {
              reject(err)
            }

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

            app.listen(port || 80, function() {
              console.log('Serving %s API on http://localhost:%d', api, port)
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
