const axios = require('axios')

const { getComposition } = require('./composition')
const { db } = require('./db')
const { round } = require('./utils')

// "Live" quotes from Yahoo Finance API
function fetchQuote (ticker) {
  console.log(`Fetching quote for ${ticker}...`)

  return new Promise((resolve, reject) => {
    const symbol = ticker === '^BVSP' ? ticker : `${ticker}.SA`

    axios.get(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`).then((response) => {
      const result = response.data.quoteResponse.result[0]

      resolve({
        ticker: ticker,
        previousClose: round(result.regularMarketPreviousClose),
        open: round(result.regularMarketOpen),
        high: round(result.regularMarketDayHigh),
        price: round(result.regularMarketPrice),
        low: round(result.regularMarketDayLow),
        volume: round(result.regularMarketVolume),
        requestTimestamp: new Date()
      })
    }).catch(err => {
      console.error(err)
      reject(err)
    })
  })
}

function fetchQuotes (tickers) {
  return Promise.all(tickers.map(fetchQuote))
}

// Cached quotes from database
// Store prices as integer
function prepareInt (num) {
  return parseInt(num * 100)
}

// Retrieve prices as float
function prepareFloat (num) {
  return round(num / 100)
}

function getQuote (ticker) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.get(
        'SELECT * FROM quotes WHERE ticker = ? ORDER BY datetime(requestTimestamp) DESC LIMIT 1;',
        [ticker.toString()],
        function (err, row) {
          if (err) return reject(err)

          if (row) {
            let q = {
              ticker: row.ticker,
              previousClose: prepareFloat(row.previousClose),
              open: prepareFloat(row.open),
              high: prepareFloat(row.high),
              price: prepareFloat(row.price),
              low: prepareFloat(row.low),
              volume: parseInt(row.volume),
              requestTimestamp: new Date(row.requestTimestamp),
            }

            q.delta = round((q.price - q.previousClose) / q.previousClose * 100)

            console.log("DEBUG: getQuote:", q.ticker, JSON.stringify(q, null, 4))

            resolve(q)
          } else {
            resolve(null)
          }
        }
      )
    })
  })
}

function getQuotes (tickers) {
  return Promise.all(tickers.map(getQuote))
}

// TODO: Keep quote history on DB when we start using a more robust RDBMS.
// Also refactor this monstrosity.
function updateQuotes () {
  console.info('Updating quotes...')

  getComposition().then(assets => fetchQuotes(assets.map(a => a.ticker))).then(quotes => {
    quotes.forEach(quote => {
      getQuote(quote.ticker).then(previousQuote => {
        if (previousQuote) {
          console.info(`Updating quote for ${quote.ticker}...`)
          console.log(`DEBUG: ${quote.ticker}`, JSON.stringify(quote, null, 4))

          db.serialize(() => {
            db.run(
              `
                UPDATE quotes SET
                  previousClose = ?,
                  open = ?,
                  high = ?,
                  price = ?,
                  low = ?,
                  volume = ?,
                  requestTimestamp = ?
                WHERE ticker = ?
              `,
              [
                prepareInt(quote.previousClose),
                prepareInt(quote.open),
                prepareInt(quote.high),
                prepareInt(quote.price),
                prepareInt(quote.low),
                parseInt(quote.volume),
                quote.requestTimestamp.toISOString(),
                quote.ticker
              ],
              function (err) {
                if (err) console.error(err)
              }
            )
          })
        } else {
          console.info(`Creating new quote for ${quote.ticker}...`)

          db.serialize(() => {
            db.run(
              `
                INSERT INTO quotes(
                  ticker,
                  previousClose,
                  open,
                  high,
                  price,
                  low,
                  volume,
                  requestTimestamp
                ) VALUES(?, ?, ?, ?, ?, ?, ?, ?)
              `,
              [
                quote.ticker,
                prepareInt(quote.previousClose),
                prepareInt(quote.open),
                prepareInt(quote.high),
                prepareInt(quote.price),
                prepareInt(quote.low),
                parseInt(quote.volume),
                quote.requestTimestamp.toISOString()
              ],
              function (err) {
                if (err) console.error(err)
              }
            )
          })
        } // if
      }) // getQuote
    }) // forEach
  }).catch(console.error) // getComposition/fetchQuotes
}

module.exports = {
  fetchQuote,
  fetchQuotes,
  getQuote,
  getQuotes,
  updateQuotes
}
