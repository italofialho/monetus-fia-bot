const { BLOCKED_GROUPS } = process.env

const blockedGroupsMiddleware = (ctx, next) => {
  const blocked = String(BLOCKED_GROUPS).split(',')
  if (blocked.indexOf(String(ctx.message.chat.id)) > -1) {
    return ctx.replyWithMarkdown(
      `🤖 Olá @${ctx.message.from.username}, agora eu tenho o meu próprio grupo para que todos possam usar meus comandos tranquilamente. Basta acessar [o novo grupo](https://t.me/monetus_fia_group) ou usar o link [https://t.me/monetus_fia_group](https://t.me/monetus_fia_group)`
    )
  }

  return next(ctx)
}

module.exports = blockedGroupsMiddleware
