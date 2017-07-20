'use strict'

const db = require('../../db')
const preferencesCollection = db.data.getCollection('preferences')

module.exports = {
  getUserPreferences(req, res) {
    const preferences = preferencesCollection.findOne({
      fiscal_code: req.swagger.params.fiscal_code.value
    })
    res.json(db.strip(preferences))
  }
}
