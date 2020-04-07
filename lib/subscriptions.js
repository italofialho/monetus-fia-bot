const { db } = require('./db')
const Subscriptions = require('./models/subscriptions')

function addSubscription (chatId) {
  return new Promise((resolve, reject) => {
    const chat = new Subscriptions({
      chatId
    })
    chat
      .save()
      .then((chat) => {
        resolve(chat._id)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function removeSubscription (chatId) {
  return new Promise((resolve, reject) => {
    Subscriptions.findOneAndDelete({ chatId })
      .then(() => {
        resolve(chatId)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function isSubscribed (chatId) {
  return new Promise((resolve, reject) => {
    Subscriptions.findOne({ chatId })
      .then((chat) => {
        resolve(chat)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function getAllSubscribed () {
  return new Promise((resolve, reject) => {
    Subscriptions.find({})
      .then((chats) => {
        resolve(chats.map((chat) => chat.chatId))
      })
      .catch((error) => {
        reject(error)
      })
  })
}

module.exports = {
  addSubscription,
  removeSubscription,
  isSubscribed,
  getAllSubscribed
}
