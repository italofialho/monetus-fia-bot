const performance = require('./performance')

const openTimePerformance = portfolioPerformance =>
  '*Mercado aberto!*\n\n' + performance(portfolioPerformance)

module.exports = openTimePerformance
