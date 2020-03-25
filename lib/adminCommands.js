
const { runUpdates } = require('./schedule/quoteUpdates')

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

module.exports = { forceUpdate }
