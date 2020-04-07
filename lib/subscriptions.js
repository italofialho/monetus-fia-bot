const Subscriptions = require('./models/subscriptions')

function addSubscription (message, frequency = 'daily') {
  return new Promise((resolve, reject) => {
    const chat = new Subscriptions({
      chatId: message.chat.id,
      userName: message.chat.username,
      firstName: message.chat.first_name,
      lastName: message.chat.last_name,
      frequency
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

function removeSubscription (chatId, frequency = 'daily') {
  return new Promise((resolve, reject) => {
    Subscriptions.findOneAndDelete({ chatId, frequency })
      .then(() => {
        resolve(chatId)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function isSubscribed (chatId, frequency = 'daily') {
  return new Promise((resolve, reject) => {
    Subscriptions.findOne({ chatId, frequency })
      .then((chat) => {
        resolve(chat)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function getAllSubscribed (frequency = 'daily') {
  return new Promise((resolve, reject) => {
    Subscriptions.find({ frequency })
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
