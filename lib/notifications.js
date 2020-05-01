const chunk = require('lodash.chunk')

const { getAllSubscribed } = require('./subscriptions')
const { getPerformance, getPerformanceImage } = require('./performance')
const momentWithHolidays = require('./utils/momentWithHolidays')

function broadcastNotifications (telegram, messageBuilder, frequency = 'daily') {

  const now = momentWithHolidays();
  const isHoliday = now.isHoliday();
  const isBusinessDay = now.isBusinessDay();

  if(isHoliday || !isBusinessDay) {
    console.log('μ-bot: Today is holiday or not is business day! Disabling automatic notifications.')
    telegram.sendMessage(
      process.env.BOT_ADMIN_ID,
      `☠️ Fala *@italofialho*, Hoje é feriado ou não é dia útil! Desativando notificações automáticas.`,
      {
        parse_mode: 'markdown'
      }
    )
    return;
  }
  

  getPerformance().then(performance => {
    getPerformanceImage().then(image => {
      const message = messageBuilder(performance)

      getAllSubscribed(frequency).then(chatIds => {
        chunk(chatIds, 30).forEach((ids, i) => { // Telegram limits to 30 msg/s
          ((i, ids) => { // Wait 1.5 seconds between each chunk
            setTimeout(() => { // This makes me hate JS so much
              ids.forEach(id => {
                telegram.sendPhoto(
                  id,
                  { source: image },
                  { caption: message, parse_mode: 'Markdown' }
                )
              })
            }, 1500 * i)
          })(i, ids)
        })
      }).catch(err => console.error(err))
    }).catch(err => console.error(err))
  }).catch(err => console.error(err))
}

module.exports = {
  broadcastNotifications
}
