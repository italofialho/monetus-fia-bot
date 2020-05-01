const { map, find } = require('lodash')
const holidaysJSON = require('./holidays.json')

const currentHoliday = (day) => {
    const list = map(holidaysJSON, (item, key) => ({name: key, date: item[0]}))
    const holiday = list.find(o => o.date == day)
    return holiday.name
}

module.exports = currentHoliday;