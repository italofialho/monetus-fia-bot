const {
  getPerformance,
  getPerformanceImage,
  getCompositionImage,
  updateTickerDetailImage,
  getTickerDetailsImage,
  updateQuoteDetailImage,
  getQuotesDetailsImage,
} = require("./performance");
const { getQuote } = require("./quotes");
const { getAsset } = require("./composition");
const messages = require("./messages");
const { parseCommand, throttle } = require("./utils");
const admin = require("./utils/admin");

const {
  addSubscription,
  removeSubscription,
  isSubscribed,
} = require("./subscriptions");

function start() {
  return messages.start();
}

function help() {
  return messages.help();
}

function products() {
  return messages.products();
}

function composition(message) {
  return new Promise((resolve, reject) => {
    const throttled = throttle(message, true);

    if (throttled && !admin.isAdmin(message)) {
      return resolve({
        error: {
          message: messages.throttle(throttled),
        },
      });
    }

    getCompositionImage()
      .then((image) => {
        resolve({
          image,
        });
      })
      .catch(reject);
  });
}

function details(message) {
  const ticker = parseCommand(message.text).args;

  return new Promise((resolve, reject) => {
    getAsset(ticker)
      .then((asset) => {
        if (!asset) return resolve(messages.assetNotFound(ticker));
        updateTickerDetailImage(asset).then(() => {
          getTickerDetailsImage(asset.ticker).then((image) => {
            resolve(image);
          });
        });
      })
      .catch(reject);
  });
}

function quote(message) {
  return new Promise((resolve, reject) => {
    const ticker = parseCommand(message.text).args;

    getAsset(ticker)
      .then((asset) => {
        if (!asset) return resolve(messages.assetNotFound(ticker));

        getQuote(asset.ticker)
          .then((quote) => {
            updateQuoteDetailImage(quote, asset)
              .then(() => {
                getQuotesDetailsImage(asset.ticker)
                  .then((image) => {
                    resolve(image);
                  })
                  .catch(reject);
              })
              .catch(reject);
          })
          .catch(reject);
      })
      .catch(reject);
  });
}

function performance(message) {
  return new Promise((resolve, reject) => {
    getPerformance()
      .then((perf) => {
        resolve(messages.performance(perf));
      })
      .catch(reject);
  });
}

function detailedPerformance(message) {
  return new Promise((resolve, reject) => {
    const throttled = throttle(message, true);

    if (throttled && !admin.isAdmin(message)) {
      return resolve({
        error: {
          message: messages.throttle(throttled),
        },
      });
    }

    getPerformance()
      .then((portfolioPerformance) => {
        getPerformanceImage()
          .then((image) => {
            resolve({
              caption: messages.detailedPerformance(portfolioPerformance),
              image,
            });
          })
          .catch(reject);
      })
      .catch(reject);
  });
}

function subscribe(message, frequency = "daily") {
  const chatId = message.chat.id;

  return new Promise((resolve, reject) => {
    if (admin.isPrivateMessage(message) || admin.isAdmin(message)) {
      isSubscribed(chatId, frequency)
        .then((subscribed) => {
          if (subscribed) {
            resolve(messages.alreadySubscribed(frequency));
          } else {
            addSubscription(message, frequency)
              .then(() => {
                resolve(messages.subscribed(frequency));
              })
              .catch(reject);
          }
        })
        .catch(reject);
    } else {
      resolve(
        "⚠️ Esse comando só pode ser executado por um admin nos grupos mas você ainda pode mandar a mesma mensagem no meu privado"
      );
    }
  });
}

function unsubscribe(message, frequency = "daily") {
  const chatId = message.chat.id;

  return new Promise((resolve, reject) => {
    if (admin.isPrivateMessage(message) || admin.isAdmin(message)) {
      isSubscribed(chatId, frequency)
        .then((subscribed) => {
          if (subscribed) {
            removeSubscription(chatId, frequency)
              .then(() => {
                resolve(messages.unsubscribed(frequency));
              })
              .catch(reject);
          } else {
            resolve(messages.notSubscribed(frequency));
          }
        })
        .catch(reject);
    } else {
      resolve(
        "⚠️ Esse comando só pode ser executado por um admin nos grupos mas você ainda pode mandar a mesma mensagem no meu privado"
      );
    }
  });
}

module.exports = {
  start,
  help,
  products,
  composition,
  details,
  quote,
  performance,
  detailedPerformance,
  subscribe,
  unsubscribe,
};
