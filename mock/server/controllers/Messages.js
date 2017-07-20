'use strict'

const db = require('../../db')
const data = require('../../fixtures')

const getMessage = (req, res) => {
  const record = data.messagesCollection.get(req.swagger.params.id.value)
  if (!record) {
    res.status(404).json({})
  } else {
    res.json(db.strip(record))
  }
}

const submitMessageforUser = (req, res) => {
  const status = {
    created_at: new Date()
  }
  const fiscal_code = req.swagger.params.fiscal_code.value
  const message = Object.assign({}, req.swagger.params.message.value, {
    status,
    fiscal_code
  })
  const record = data.messagesCollection.insert(message)
  const ret = {
    id: record.$loki.toString(),
    status,
    fiscal_code
  }
  res.status(201).json(ret)
}

module.exports = { getMessage, submitMessageforUser }
