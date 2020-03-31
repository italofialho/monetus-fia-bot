const { Composer, Extra, log, session, start } = require('micro-bot')

const { caseInsensitiveCommands } = require('./middlewares')
const { apiError, unexpectedError } = require('./messages')
const { setupDB } = require('./db')
const schedule = require('./schedule')
const commands = require('./commands')
const adminCommands = require('./adminCommands')
const admin = require('./utils/admin')

// Prepare DB
setupDB()

const bot = new Composer()

bot.init = (ctx) => {
  return new Promise(resolve => {
    console.log('μ-bot: init')
    schedule(ctx.telegram)
    resolve()
  })
}

// Schedule crons
// bot.start = ({ telegram }) =>

bot.use(log())
bot.use(session())
bot.use(caseInsensitiveCommands)

bot.start(({ reply }) => reply(commands.start()))

bot.help(({ replyWithMarkdown }) => replyWithMarkdown(commands.help()))

// Start
// bot.command('start', ({ replyWithMarkdown }) =>
//   replyWithMarkdown(commands.start())
// )

// Composition
bot.command('c', ({ replyWithMarkdown, replyWithPhoto, message }) =>
  commands
    .composition(message)
    .then(({ image, error }) => {
      if (error) {
        return replyWithMarkdown(error.message)
      }

      return replyWithPhoto({ source: image })
    })
    .catch(() => replyWithMarkdown(unexpectedError()))
)

// Details
bot.command('d', ({ replyWithMarkdown, replyWithPhoto, message }) =>
  commands
    .details(message)
    .then(image => {
      replyWithPhoto({ source: image })
    })
    .catch(() => replyWithMarkdown(unexpectedError()))
)

// Quote
bot.command('q', ({ replyWithPhoto, replyWithMarkdown, message }) =>
  commands
    .quote(message)
    .then(image => replyWithPhoto({ source: image }))
    .catch(() => replyWithMarkdown(apiError()))
)

// Performance
bot.command('p', ({ replyWithMarkdown, message }) =>
  commands
    .performance(message)
    .then(replyWithMarkdown)
    .catch(() => replyWithMarkdown(apiError()))
)

// Detailed Performance
bot.command('pd', ({ replyWithMarkdown, replyWithPhoto, message }) =>
  commands
    .detailedPerformance(message)
    .then(({ image, caption, error }) => {
      if (error) {
        return replyWithMarkdown(error.message)
      }

      return replyWithPhoto(
        { source: image },
        Extra.load({ caption }).markdown()
      )
    })
    .catch(console.error)
)

// Subscribe to daily notifications
bot.command('subscribe', ({ replyWithMarkdown, message }) =>
  commands
    .subscribe(message)
    .then(replyWithMarkdown)
    .catch(() => replyWithMarkdown(unexpectedError()))
)

// Unsubscribe from daily notifications
bot.command('unsubscribe', ({ replyWithMarkdown, message }) =>
  commands
    .unsubscribe(message)
    .then(replyWithMarkdown)
    .catch(() => replyWithMarkdown(unexpectedError()))
)

bot.command('force_update', ({ replyWithMarkdown, message }) => {
  adminCommands
    .forceUpdate(message)
    .then(({ isAdmin }) => {
      if (isAdmin) replyWithMarkdown('✅ Informações atualizadas com sucesso!')
      else {
        replyWithMarkdown(
          '⚠️ Esse comando só pode ser executado por um admin.'
        )
      }
    })
    .catch(error => {
      console.log('--> error:', error)
      replyWithMarkdown('❌ Tivemos um problema para atualizar as informações')
    })
})

module.exports = bot
