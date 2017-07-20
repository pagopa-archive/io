'use strict'

const Loki = require('lokijs')
const data = new Loki('.loki.json')

const stripOne = loki_rec => {
  const clean_rec = Object.assign({}, loki_rec)
  delete clean_rec['meta']
  delete clean_rec['$loki']
  return clean_rec
}

const strip = results =>
  Array.isArray(results) ? results.map(stripOne) : stripOne(results)

module.exports = { data, strip }
