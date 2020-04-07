const parseFrequency = require('../utils/parseFrequency')
const subscribed = (frequency) =>
  `✅ Inscrito com sucesso! Você receberá notificações ${parseFrequency(frequency)}.`

module.exports = subscribed
