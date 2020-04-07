const { Schema, model } = require('mongoose')

var schema = new Schema({
  chatId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  userName: { type: String, required: true },
  frequency: { type: String, required: true, default: 'daily' },
  subscribedAt: { type: String, default: Date.now(), required: true }
})
var Subscriptions = model('Subscriptions', schema)

module.exports = Subscriptions
