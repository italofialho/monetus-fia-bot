const parseFrequency = require('../utils/parseFrequency')

const notSubscribed = (frequency) =>
  `🙃 Você não está inscrito para receber notificações ${parseFrequency(
    frequency
  )}.`

module.exports = notSubscribed
