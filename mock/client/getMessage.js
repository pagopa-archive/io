/**
 * Example client for Notifications API.
 * 
 * Get an already submitted message.
 */
'use strict'

const config = require('./config')
const request = require('request')

const getMessage = id => {
  request.get(
    `${config.NOTIFICATION_API_URL}/messages/${id}`,
    (err, res, body) => {
      console.dir(err ? err : body, { depth: 4 })
    }
  )
}

getMessage(process.argv[2])
