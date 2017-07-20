'use strict'

const db = require('./db')
const faker = require('faker/locale/it')

const preferencesCollection = db.data.addCollection('preferences')
const messagesCollection = db.data.addCollection('messages')

function insert() {
  preferencesCollection.insert({
    fiscal_code: 'SPNDNL80A11C111A',
    email: faker.internet.email()
  })

  preferencesCollection.insert({
    fiscal_code: 'FRLFDR80A11C111A',
    email: faker.internet.email()
  })
}

module.exports = { insert, preferencesCollection, messagesCollection }
