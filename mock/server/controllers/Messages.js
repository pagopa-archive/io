'use strict'

const data = require('../../fixtures')

const getMessage = (req, res) => {
  const message = data.messagesCollection.get(req.swagger.params.id.value)
  if (!message) {
    res.status(404).json({})
  }
  else {
    res.json(message)
  }
}

const submitMessageforUser = (req, res) => {
  const message = req.swagger.params.message.value
  const record = data.messagesCollection.insert(message)
  let ret = {
    id: record.$loki,
    status: {
      created_at: new Date()
    }
  }
  res.status(201).json(ret)
}

module.exports = { getMessage, submitMessageforUser }
