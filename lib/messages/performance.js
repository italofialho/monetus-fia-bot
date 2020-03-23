const { formatDelta, emojiDelta } = require('../utils')

const performance = portfolioPerformance => `*Performance da carteira*: ${emojiDelta(portfolioPerformance.delta)} ${formatDelta(portfolioPerformance.delta)}`

module.exports = performance
