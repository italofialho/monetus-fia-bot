const momentWithHolidays = require("../utils/momentWithHolidays");
const { operationHours } = require("../stockExchange");
const admin = require("../utils/admin");

const businessDaysAndHours = (ctx, next) => {
  const messageDate = momentWithHolidays
    .unix(ctx.message.date)
    .tz("America/Sao_Paulo");

  if (admin.isAdmin(ctx.message)) return next(ctx);

  const command = ctx.message.text;
  if (
    !(
      String(command).indexOf("/pd") !== -1 ||
      String(command).indexOf("/p") !== -1
    )
  )
    return next(ctx);

  const isHoliday = messageDate.isHoliday();
  const isBusinessDay = messageDate.isBusinessDay();

  if (!isHoliday && !isBusinessDay) {
    return ctx.replyWithMarkdown(
      `🤖 @${ctx.message.from.username} no final de semana o mercado não opera! Por isso não é possível visualizar o desempenho do FIA 😖`
    );
  }

  if (isHoliday) {
    return ctx.replyWithMarkdown(
      `🤖 Hoje muito provavelmente é feriado @${ctx.message.from.username}, e o mercado não está operando agora! Por isso não é possível visualizar o desempenho do FIA 😖`
    );
  }

  if (isBusinessDay) {
    const beforeTime = momentWithHolidays(
      `${operationHours.openTime.hour}:${operationHours.openTime.minute}`,
      "HH:mm"
    );
    const afterTime = momentWithHolidays(
      `${operationHours.afterMarketCloseTime.hour}:${operationHours.afterMarketCloseTime.minute}`,
      "HH:mm"
    );

    if (!messageDate.isBetween(beforeTime, afterTime)) {
      return ctx.replyWithMarkdown(
        `⚠️ **Fora do horario** ⚠️\n\n🤖 Fui criado para informar a performace do fundo apenas entre às **${process.env.STOCK_EXCHANGE_OPEN_TIME}** e às **${process.env.STOCK_EXCHANGE_AFTER_MARKET_CLOSE_TIME}** e em apenas dias úteis. 😇`
      );
    }
  }

  return next(ctx);
};

module.exports = businessDaysAndHours;
