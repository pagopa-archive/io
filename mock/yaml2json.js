'use strict'

var YAML = require('js-yaml')
var fs = require('fs')

var root = YAML.load(fs.readFileSync(process.argv[2]).toString())
console.log(JSON.stringify(root))
