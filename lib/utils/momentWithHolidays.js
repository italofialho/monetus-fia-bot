const { flatMap } = require('lodash')
const Moment = require('moment-business-days')
const holidaysJSON = require('./holidays.json')
const holidays = flatMap(holidaysJSON)

const momentWithHolidays = Moment
momentWithHolidays.updateLocale('pt-br', {
  holidays: holidays,
  holidayFormat: 'DD/MM'
})

module.exports = momentWithHolidays
