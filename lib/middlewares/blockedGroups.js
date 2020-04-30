const utils = require('../utils')
const { BLOCKED_GROUPS } = process.env

const blockedGroupsMiddleware = (ctx, next) => {
  const blocked = String(BLOCKED_GROUPS).split(',')
  if (blocked.indexOf(String(ctx.message.chat.id)) > -1) {
    return ctx.replyWithMarkdown(
      `🤖 Olá ${utils.getFirstNameOrUserName(ctx.message.from)}, agora eu tenho o meu próprio grupo para que todos possam usar meus comandos tranquilamente. Basta acessar [o novo grupo](https://t.me/joinchat/LWVw_Ro1qWookMIt4JZAbA) ou usar o link [https://t.me/monetus_fia_group](https://t.me/joinchat/LWVw_Ro1qWookMIt4JZAbA)`
    )
  }

  return next(ctx)
}

module.exports = blockedGroupsMiddleware
