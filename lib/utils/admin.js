const isAdmin = (message) => {
  return message.chat.id === process.env.BOT_ADMIN_ID
}

const isPrivateMessage = (message) => {
  return message.chat.type === 'private'
}

module.exports = { isAdmin, isPrivateMessage }
