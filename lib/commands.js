const { getPerformance, getPerformanceImage, getCompositionImage, updateTickerDetailImage, getTickerDetailsImage, updateQuoteDetailImage, getQuotesDetailsImage } = require('./performance')
const { getQuote } = require('./quotes')
const { getAsset } = require('./composition')
const messages = require('./messages')
const {
  parseCommand,
  throttle
} = require('./utils')

const {
  addSubscription,
  removeSubscription,
  isSubscribed
} = require('./subscriptions')

function start () {
  return messages.start()
}

function help () {
  return messages.help()
}

function composition (message) {
  return new Promise((resolve, reject) => {
    const throttled = throttle(message, true)

    if (throttled) {
      return resolve({
        error: {
          message: messages.throttle(throttled)
        }
      })
    }

    const image = getCompositionImage()

    resolve({
      image
    })
  })
}

function details (message) {
  const ticker = parseCommand(message.text).args

  return new Promise((resolve, reject) => {
    getAsset(ticker).then(asset => {
      if (!asset) return resolve(messages.assetNotFound(ticker))

      updateTickerDetailImage(asset).then(() => {
        const image = getTickerDetailsImage(asset.ticker)
        resolve(image)
      })
    }).catch(reject)
  })
}

function quote (message) {
  return new Promise((resolve, reject) => {
    const ticker = parseCommand(message.text).args

    getAsset(ticker).then(asset => {
      if (!asset) return resolve(messages.assetNotFound(ticker))

      getQuote(asset.ticker).then(quote => {
        updateQuoteDetailImage(quote, asset).then(() => {
          getQuotesDetailsImage(asset.ticker).then(image => {
            resolve(image)
          }).catch(reject)
        }).catch(reject)
      }).catch(reject)
    }).catch(reject)
  })
}

function performance (message) {
  return new Promise((resolve, reject) => {
    getPerformance().then(perf => {
      resolve(messages.performance(perf))
    }).catch(reject)
  })
}

function detailedPerformance (message) {
  return new Promise((resolve, reject) => {
    const throttled = throttle(message, true)

    if (throttled) {
      return resolve({
        error: {
          message: messages.throttle(throttled)
        }
      })
    }

    getPerformance()
      .then(portfolioPerformance => {
        getPerformanceImage().then(image => {
          resolve({
            caption: messages.detailedPerformance(portfolioPerformance),
            image
          })
        }).catch(reject)
      })
      .catch(reject)
  })
}

function subscribe (message) {
  const chatId = message.chat.id

  return new Promise((resolve, reject) => {
    isSubscribed(chatId).then((subscribed) => {
      if (subscribed) {
        resolve(messages.alreadySubscribed())
      } else {
        addSubscription(chatId).then(() => {
          resolve(messages.subscribed())
        }).catch(reject)
      }
    }).catch(reject)
  })
}

function unsubscribe (message) {
  const chatId = message.chat.id

  return new Promise((resolve, reject) => {
    isSubscribed(chatId).then((subscribed) => {
      if (subscribed) {
        removeSubscription(chatId).then(() => {
          resolve(messages.unsubscribed())
        }).catch(reject)
      } else {
        resolve(messages.notSubscribed())
      }
    }).catch(reject)
  })
}

module.exports = {
  start,
  help,
  composition,
  details,
  quote,
  performance,
  detailedPerformance,
  subscribe,
  unsubscribe
}
