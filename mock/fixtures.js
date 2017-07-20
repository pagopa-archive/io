'use strict'

const db = require('./db')

const preferencesCollection = db.data.addCollection('preferences')
const messagesCollection = db.data.addCollection('messages')

function insert() {
  preferencesCollection.insert({
    fiscal_code: 'SPNDNL80R11C111K',
    email: 'danilo.spinelli@agid.gov.it'
  })

  preferencesCollection.insert({
    fiscal_code: 'FRLFDC80R11C111K',
    email: 'federico@teamdigitale.governo.it'
  })
}

module.exports = { insert, preferencesCollection, messagesCollection }
