/**
 * Example client for Notifications API.
 * 
 * Submits a message for delivery.
 */
'use strict'

const config = require('./config')
const request = require('request')
const faker = require('faker/locale/it')
const data = require('../fixtures.js')

// inserts fake user data
data.insert()

const sendMessage = (fiscal_code, message) => {
  var options = {
    uri: `${config.NOTIFICATION_API_URL}/users/${fiscal_code}/messages`,
    method: 'POST',
    json: message
  }
  request(options, (err, res, body) => {
    console.dir(err ? err : body, { depth: 4 })
  })
}

// get one fiscal code from fake user data
const fiscal_code = data.preferencesCollection.findOne({}).fiscal_code

sendMessage(fiscal_code, {
  dry_run: false,
  time_to_live: 3600,
  content: {
    body_short: faker.lorem.sentence(),
    body_long: faker.lorem.paragraphs()
  }
})
