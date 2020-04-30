const { Composer, Extra, log, session } = require("micro-bot");

const {
  caseInsensitiveCommands,
  blockedGroupsMiddleware,
  businessDaysAndHours,
} = require("./middlewares");
const { apiError, unexpectedError } = require("./messages");
const { setupDB } = require("./db");
const schedule = require("./schedule");
const commands = require("./commands");
const adminCommands = require("./adminCommands");
const mongoose = require("mongoose");
const moment = require("moment");
const utils = require("./utils");
const Sentry = require("@sentry/node");

Sentry.init({ dsn: process.env.SENTRY_DSN });

const bot = new Composer();

// Prepare DB
setupDB();

const replyErrorToAdmin = (telegram, message, error) => {
  return telegram.sendMessage(
    process.env.BOT_ADMIN_ID,
    `☠️ Olá *@italofialho*, eu acabei de ter um problema com algum comando.

    O ${utils.getFirstNameOrUserName(message.from)} me mandou *${message.text}*.
    Como não sabia o que responder eu enviei isso aqui:

    \`\`\`
    ${error}
    \`\`\``,
    {
      parse_mode: "markdown",
    }
  );
};

// Start
bot.init = (ctx) => {
  return new Promise((resolve) => {
    console.log(`μ-bot: init on ${process.env.ENV} mode`);

    // Schedule crons
    schedule(ctx.telegram);
    if (process.env.ENV !== "dev") {
      ctx.telegram.sendMessage(
        process.env.BOT_ADMIN_ID,
        `🤖 Oi *@italofialho*, estou no ar! Agora são *${moment().format(
          "HH:mm:ss"
        )}*`,
        {
          parse_mode: "markdown",
        }
      );
    }

    mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("μ-bot: Connected to mongo"))
      .catch((error) => {
        console.log("μ-bot: Can't connect to mongo");
        Sentry.captureException(error);
      });

    resolve();
  });
};

bot.catch = (error, ctx) => {
  const sentryErrorId = Sentry.captureException(error);
  ctx.telegram.sendMessage(
    process.env.BOT_ADMIN_ID,
    `☠️ Oi *@italofialho*, eu acabei de ter um erro interno e enviei o relatório par ao Sentry *${sentryErrorId}*.\n\nO problema que eu tive foi essea aqui:\n\n\`\`\`${error}\`\`\``,
    {
      parse_mode: "markdown",
    }
  );
};

bot.use(log());
bot.use(session());
bot.use(caseInsensitiveCommands);
bot.use(blockedGroupsMiddleware);
bot.use(businessDaysAndHours);

bot.start(({ reply }) => reply(commands.start()));

bot.help(({ replyWithMarkdown }) => replyWithMarkdown(commands.help()));

// Composition
bot.command("c", ({ replyWithMarkdown, replyWithPhoto, message, telegram }) =>
  commands
    .composition(message)
    .then(({ image, error }) => {
      if (error) {
        replyErrorToAdmin(telegram, message, error.message);
        return replyWithMarkdown(error.message);
      }

      return replyWithPhoto({ source: image });
    })
    .catch(() => replyWithMarkdown(unexpectedError()))
);

// Details
bot.command("d", ({ replyWithMarkdown, replyWithPhoto, message, telegram }) =>
  commands
    .details(message)
    .then((image) => {
      replyWithPhoto({ source: image });
    })
    .catch(() => {
      replyErrorToAdmin(telegram, message, unexpectedError());
      replyWithMarkdown(unexpectedError());
    })
);

// Quote
bot.command("q", ({ replyWithPhoto, replyWithMarkdown, message, telegram }) =>
  commands
    .quote(message)
    .then((image) => replyWithPhoto({ source: image }))
    .catch(() => {
      replyErrorToAdmin(telegram, message, apiError());
      replyWithMarkdown(apiError());
    })
);

// Performance
bot.command("p", ({ replyWithMarkdown, message, telegram }) =>
  commands
    .performance(message)
    .then(replyWithMarkdown)
    .catch(() => {
      replyErrorToAdmin(telegram, message, apiError());
      replyWithMarkdown(apiError());
    })
);

// Detailed Performance
bot.command("pd", ({ replyWithMarkdown, replyWithPhoto, message, telegram }) =>
  commands
    .detailedPerformance(message)
    .then(({ image, caption, error }) => {
      if (error) {
        replyErrorToAdmin(telegram, message, error.message);
        return replyWithMarkdown(error.message);
      }

      return replyWithPhoto(
        { source: image },
        Extra.load({ caption }).markdown()
      );
    })
    .catch(() => {
      replyErrorToAdmin(telegram, message, apiError());
      replyWithMarkdown(apiError());
    })
);

// Subscribe to daily notifications
bot.command("subscribe", ({ replyWithMarkdown, message, telegram }) =>
  commands
    .subscribe(message)
    .then(replyWithMarkdown)
    .catch((err) => {
      replyErrorToAdmin(telegram, message, unexpectedError());
      replyWithMarkdown(unexpectedError());
    })
);

// Unsubscribe from daily notifications
bot.command("unsubscribe", ({ replyWithMarkdown, message, telegram }) =>
  commands
    .unsubscribe(message)
    .then(replyWithMarkdown)
    .catch(() => {
      replyErrorToAdmin(telegram, message, unexpectedError());
      replyWithMarkdown(unexpectedError());
    })
);

// Subscribe to hourly notifications
bot.command("hourly_subscribe", ({ replyWithMarkdown, message, telegram }) =>
  commands
    .subscribe(message, "hourly")
    .then(replyWithMarkdown)
    .catch(() => {
      replyErrorToAdmin(telegram, message, unexpectedError());
      replyWithMarkdown(unexpectedError());
    })
);

// Unsubscribe from daily notifications
bot.command("hourly_unsubscribe", ({ replyWithMarkdown, message, telegram }) =>
  commands
    .unsubscribe(message, "hourly")
    .then(replyWithMarkdown)
    .catch(() => {
      replyErrorToAdmin(telegram, message, unexpectedError());
      replyWithMarkdown(unexpectedError());
    })
);

bot.command("force_update", ({ replyWithMarkdown, message, telegram }) => {
  adminCommands
    .forceUpdate(message)
    .then(({ isAdmin }) => {
      if (isAdmin) {
        replyWithMarkdown("✅ Informações atualizadas com sucesso!");
      } else {
        replyErrorToAdmin(
          telegram,
          message,
          "⚠️ Esse comando só pode ser executado por um admin."
        );
        replyWithMarkdown(
          "⚠️ Esse comando só pode ser executado por um admin."
        );
      }
    })
    .catch(() => {
      replyErrorToAdmin(
        telegram,
        message,
        "❌ Tivemos um problema para atualizar as informações"
      );
      replyWithMarkdown("❌ Tivemos um problema para atualizar as informações");
    });
});

bot.command("subs", ({ replyWithMarkdown, message, telegram }) => {
  adminCommands
    .getSubsCount(message)
    .then(({ isAdmin, count }) => {
      if (isAdmin) {
        replyWithMarkdown(
          `🤖 Oi *Italo*, hoje nós temos *${count}* pessoa${
            count !== 1 ? "s" : ""
          } recebendo as minhas notificações 💙`
        );
      } else {
        replyErrorToAdmin(
          telegram,
          message,
          "⚠️ Esse comando só pode ser executado por um admin."
        );
        replyWithMarkdown(
          "⚠️ Esse comando só pode ser executado por um admin."
        );
      }
    })
    .catch(() => {
      replyErrorToAdmin(
        telegram,
        message,
        "❌ Tivemos um problema para atualizar as informações"
      );
      replyWithMarkdown("❌ Tivemos um problema para atualizar as informações");
    });
});
bot.command("subs_list", ({ replyWithMarkdown, message, telegram }) => {
  adminCommands
    .getSubsList(message)
    .then(({ isAdmin, listText }) => {
      if (isAdmin) {
        replyWithMarkdown(
          `🤖 Oi *Italo*, essa é a lista que vai receber as minhas notificações:

          ${listText}
          `
        );
      } else {
        replyErrorToAdmin(
          telegram,
          message,
          "⚠️ Esse comando só pode ser executado por um admin."
        );
        replyWithMarkdown(
          "⚠️ Esse comando só pode ser executado por um admin."
        );
      }
    })
    .catch(() => {
      replyErrorToAdmin(
        telegram,
        message,
        "❌ Tivemos um problema para atualizar as informações"
      );
      replyWithMarkdown("❌ Tivemos um problema para atualizar as informações");
    });
});

module.exports = bot;
