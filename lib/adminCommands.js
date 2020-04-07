const { runUpdates } = require('./schedule/quoteUpdates')
const Subscriptions = require('./models/subscriptions')

const admin = require('./utils/admin')

function forceUpdate (message) {
  return new Promise((resolve) => {
    if (admin.isAdmin(message)) {
      return resolve({ isAdmin: false })
    }

    runUpdates()
    resolve({ isAdmin: true })
  })
}

function getSubsCount (message) {
  return new Promise((resolve, reject) => {
    if (admin.isAdmin(message)) {
      return resolve({ isAdmin: false, count: 0 })
    }

    Subscriptions.count()
      .then((count) => {
        resolve({ isAdmin: true, count })
      })
      .catch((error) => {
        reject(error)
      })
  })
}
function getSubsList (message) {
  return new Promise((resolve, reject) => {
    if (admin.isAdmin(message)) {
      return resolve({ isAdmin: false, listText: null })
    }

    Subscriptions.find({})
      .then((list) => {
        console.log('--> list:', list)

        if (!list.length) return resolve({ isAdmin: true, listText: '👻 Ninguem... 👻' })

        const listText = list.map((chat) => {
          return `
            *@${chat.userName} ${chat.firstName} (${chat.chatId})*
            --------------------
            `
        })

        resolve({ isAdmin: true, listText })
      })
      .catch((error) => {
        reject(error)
      })
  })
}

module.exports = { forceUpdate, getSubsCount, getSubsList }
