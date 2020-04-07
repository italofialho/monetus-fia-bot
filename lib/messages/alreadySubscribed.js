const parseFrequency = require('../utils/parseFrequency')

const alreadySubscribed = (frequency) =>
  `✅ Você já está inscrito para receber notificações ${parseFrequency(
    frequency
  )}.`

module.exports = alreadySubscribed
