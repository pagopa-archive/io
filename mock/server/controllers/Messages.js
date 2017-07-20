'use strict'

module.exports = {
  getMessage(req, res) {
    res.json(req.swagger.params.id.value)
  }
}
