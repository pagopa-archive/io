'use strict'

const db = require('../../db')
const data = require('../../fixtures')

module.exports = {
  getUserPreferences(req, res) {
    const preferences = data.preferencesCollection.findOne({
      fiscal_code: req.swagger.params.fiscal_code.value
    })
    res.json(db.strip(preferences))
  }
}
