const { Schema, model } = require('mongoose')

var schema = new Schema({
  chatId: { type: String, required: true },
  subscribedAt: { type: String, default: Date.now(), required: true }
})
var Subscriptions = model('Subscriptions', schema)

module.exports = Subscriptions
