const parseFrequency = require('../utils/parseFrequency')

const unsubscribed = (frequency) =>
  `✅ Inscrição removida com sucesso! Você não receberá mais notificações ${parseFrequency(frequency)}.`

module.exports = unsubscribed
