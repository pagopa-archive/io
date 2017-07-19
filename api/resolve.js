'use strict'

var resolve = require('json-refs').resolveRefs
var YAML = require('js-yaml')
var fs = require('fs')

var root = require('./notifications-api-public.json')

// var root = YAML.load(fs.readFileSync('index.yaml').toString())
// var options = {
//   processContent: function(content) {
//     return YAML.load(content)
//   }
// }

var options = {}

resolve(root, options).then(function(results) {
  console.log(YAML.dump(results.resolved))
})
