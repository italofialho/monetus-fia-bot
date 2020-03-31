const { Composer, Extra, log, session } = require('micro-bot')

const { caseInsensitiveCommands } = require('./middlewares')
const { apiError, unexpectedError } = require('./messages')
const { setupDB } = require('./db')
const schedule = require('./schedule')
const commands = require('./commands')
const adminCommands = require('./adminCommands')
const admin = require('./utils/admin')
const moment = require('moment')
const momentTZ = require('moment-timezone')

// Prepare DB
setupDB()

const replyErrorToAdmin = (telegram, message, error) => {
  return telegram.sendMessage(
    process.env.BOT_ADMIN_ID,
    `☠️ Olá *@italofialho*, eu acabei de ter um problema com algum comando.

    O *@${message.from.username}* me mandou *${message.text}*.
    Como não sabia o que responder eu enviei isso aqui:

    \`\`\`
    ${error}
    \`\`\``,
    {
      parse_mode: 'markdown'
    }
  )
}

const bot = new Composer()

// Start
bot.init = ctx => {
  return new Promise(resolve => {
    console.log('μ-bot: init')
    // Schedule crons
    schedule(ctx.telegram)
    ctx.telegram.sendMessage(
      process.env.BOT_ADMIN_ID,
      `🤖 Oi *Italo*, estou no ar! Agora são *${moment().format('HH:mm:ss')}* no meu horário local e são *${momentTZ().tz('America/Sao_Paulo').format('HH:mm:ss')}* no horário de Brasilia.`,
      {
        parse_mode: 'markdown'
      }
    )
    resolve()
  })
}

bot.use(log())
bot.use(session())
bot.use(caseInsensitiveCommands)

bot.start(({ reply }) => reply(commands.start()))

bot.help(({ replyWithMarkdown }) => replyWithMarkdown(commands.help()))

// Composition
bot.command('c', ({ replyWithMarkdown, replyWithPhoto, message, telegram }) =>
  commands
    .composition(message)
    .then(({ image, error }) => {
      if (error) {
        replyErrorToAdmin(telegram, message, error.message)
        return replyWithMarkdown(error.message)
      }

      return replyWithPhoto({ source: image })
    })
    .catch(() => replyWithMarkdown(unexpectedError()))
)

// Details
bot.command('d', ({ replyWithMarkdown, replyWithPhoto, message, telegram }) =>
  commands
    .details(message)
    .then(image => {
      replyWithPhoto({ source: image })
    })
    .catch(() => {
      replyErrorToAdmin(telegram, message, unexpectedError())
      replyWithMarkdown(unexpectedError())
    })
)

// Quote
bot.command('q', ({ replyWithPhoto, replyWithMarkdown, message, telegram }) =>
  commands
    .quote(message)
    .then(image => replyWithPhoto({ source: image }))
    .catch(() => {
      replyErrorToAdmin(telegram, message, apiError())
      replyWithMarkdown(apiError())
    })
)

// Performance
bot.command('p', ({ replyWithMarkdown, message, telegram }) =>
  commands
    .performance(message)
    .then(replyWithMarkdown)
    .catch(() => {
      replyErrorToAdmin(telegram, message, apiError())
      replyWithMarkdown(apiError())
    })
)

// Detailed Performance
bot.command('pd', ({ replyWithMarkdown, replyWithPhoto, message, telegram }) =>
  commands
    .detailedPerformance(message)
    .then(({ image, caption, error }) => {
      if (error) {
        replyErrorToAdmin(telegram, message, error.message)
        return replyWithMarkdown(error.message)
      }

      return replyWithPhoto(
        { source: image },
        Extra.load({ caption }).markdown()
      )
    })
    .catch(() => {
      replyErrorToAdmin(telegram, message, apiError())
      replyWithMarkdown(apiError())
    })
)

// Subscribe to daily notifications
bot.command('subscribe', ({ replyWithMarkdown, message, telegram }) =>
  commands
    .subscribe(message)
    .then(replyWithMarkdown)
    .catch(() => {
      replyErrorToAdmin(telegram, message, unexpectedError())
      replyWithMarkdown(unexpectedError())
    })
)

// Unsubscribe from daily notifications
bot.command('unsubscribe', ({ replyWithMarkdown, message, telegram }) =>
  commands
    .unsubscribe(message)
    .then(replyWithMarkdown)
    .catch(() => {
      replyErrorToAdmin(telegram, message, unexpectedError())
      replyWithMarkdown(unexpectedError())
    })
)

bot.command('force_update', ({ replyWithMarkdown, message, telegram }) => {
  adminCommands
    .forceUpdate(message)
    .then(({ isAdmin }) => {
      if (isAdmin) replyWithMarkdown('✅ Informações atualizadas com sucesso!')
      else {
        replyErrorToAdmin(
          telegram,
          message,
          '⚠️ Esse comando só pode ser executado por um admin.'
        )
        replyWithMarkdown(
          '⚠️ Esse comando só pode ser executado por um admin.'
        )
      }
    })
    .catch(() => {
      replyErrorToAdmin(
        telegram,
        message,
        '❌ Tivemos um problema para atualizar as informações'
      )
      replyWithMarkdown('❌ Tivemos um problema para atualizar as informações')
    })
})

module.exports = bot
