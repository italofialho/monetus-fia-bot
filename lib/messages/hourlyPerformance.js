const performance = require('./performance')
const moment = require('moment-timezone')
const hourlyPerformance = (portfolioPerformance) =>
  `*Notificações de hora em hora!* _(${moment().tz('America/Sao_Paulo').format('HH:mm')})_\n\n ${performance(
    portfolioPerformance
  )}`

module.exports = hourlyPerformance
