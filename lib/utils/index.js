const formatDelta = require('./formatDelta')
const emojiDelta = require('./emojiDelta')
const formatNumber = require('./formatNumber')
const formatTimeLeft = require('./formatTimeLeft')
const {
  generatePerformaceHtmlTable,
  generateCompositionHtmlTable,
  generateTickerDetailsHtmlTable,
  generateQuoteDetailsHtmlTable
} = require('./generateHtmlTable')
const htmlToImage = require('./htmlToImage')
const generateCompositionAssetMarkdown = require('./generateCompositionAssetMarkdown')
const parseCommand = require('./parseCommand')
const round = require('./round')
const getFirstNameOrUserName = require('./getFirstNameOrUserName')
const currentHoliday = require('./currentHoliday')

// TODO: Persist this on db
let lastCommands = {}
const min = 60000 * 30 // 30 minutes in milliseconds

function throttle (message, ignoreArgs) {
  // Don't throttle private messages, only groups/supergroups
  if (message.chat.type === 'private') return false

  const c = parseCommand(message.text)

  let k = message.chat.id.toString() + c.command
  if (!ignoreArgs) k += c.args

  const last = lastCommands[k]
  const time = Date.now()

  if (last) {
    const timeAgo = time - last

    if (timeAgo < min) {
      const left = (min - timeAgo) / 1000
      return left
    }
  }

  lastCommands[k] = time
  return false
}

module.exports = {
  formatDelta,
  formatTimeLeft,
  generatePerformaceHtmlTable,
  generateCompositionHtmlTable,
  generateTickerDetailsHtmlTable,
  htmlToImage,
  generateCompositionAssetMarkdown,
  generateQuoteDetailsHtmlTable,
  parseCommand,
  round,
  throttle,
  emojiDelta,
  formatNumber,
  getFirstNameOrUserName,
  currentHoliday
}
