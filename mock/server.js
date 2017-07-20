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

const promises = []

for (let api of APIs) {
  promises.push(
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
}

module.exports = Promise.all(promises)
