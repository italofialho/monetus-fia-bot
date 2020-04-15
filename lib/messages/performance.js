const { formatDelta, emojiDelta } = require('../utils')

const performance = portfolioPerformance => `*Performance do FIA*: ${emojiDelta(portfolioPerformance.delta)} ${formatDelta(portfolioPerformance.delta)}`

module.exports = performance
