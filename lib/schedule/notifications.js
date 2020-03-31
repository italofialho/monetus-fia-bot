const schedule = require('node-schedule')

const { broadcastNotifications } = require('../notifications')
// eslint-disable-next-line standard/object-curly-even-spacing
const {
  normalHoursPerformance,
  afterMarketPerformance,
  openTimePerformance
} = require('../messages')
const { operationHours } = require('../stockExchange')

function scheduleNotifications (telegram) {
  const workDays = new schedule.Range(1, 5)

  let normalHours = new schedule.RecurrenceRule()
  normalHours.dayOfWeek = workDays
  normalHours.hour = operationHours.marketCloseTime.hour
  normalHours.minute = operationHours.marketCloseTime.minute
  schedule.scheduleJob(normalHours, function () {
    broadcastNotifications(telegram, normalHoursPerformance)
  })

  let afterMarketHours = new schedule.RecurrenceRule()
  afterMarketHours.dayOfWeek = workDays
  afterMarketHours.hour = operationHours.afterMarketCloseTime.hour
  afterMarketHours.minute = operationHours.afterMarketCloseTime.minute
  schedule.scheduleJob(afterMarketHours, function () {
    broadcastNotifications(telegram, afterMarketPerformance)
  })

  let openTimeHours = new schedule.RecurrenceRule()
  openTimeHours.dayOfWeek = workDays
  openTimeHours.hour = operationHours.openTime.hour
  openTimeHours.minute = operationHours.openTime.minute
  schedule.scheduleJob(openTimeHours, function () {
    broadcastNotifications(telegram, openTimePerformance)
  })
}

module.exports = scheduleNotifications
