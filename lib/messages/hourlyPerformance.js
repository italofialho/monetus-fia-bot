const performance = require('./performance')
const moment = require('moment-timezone')
const now = moment().tz('America/Sao_Paulo').startOf('minutes').format('HH:mm')
const hourlyPerformance = (portfolioPerformance) =>
  `*Notificações de hora em hora!* _(${now})_\n\n ${performance(
    portfolioPerformance
  )}`

module.exports = hourlyPerformance
