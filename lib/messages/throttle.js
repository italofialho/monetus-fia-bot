const { formatTimeLeft } = require('../utils')

const throttle = secondsLeft =>
  `⚙️ Eu enviei essa informação recentemente, daqui a ${formatTimeLeft(secondsLeft)} minutos será possível executar esse comando novamente. ☺️`

module.exports = throttle
