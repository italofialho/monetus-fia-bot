const fs = require('fs')
const nodeHtmlToImage = require('node-html-to-image')

const { getComposition } = require('./composition')
const { getQuotes, fetchQuote } = require('./quotes')
const { generatePerformaceHtmlTable, generateCompositionHtmlTable, generateTickerDetailsHtmlTable, generateQuoteDetailsHtmlTable, round } = require('./utils')

function getPerformance () {
  let performance = {
    assets: [],
    benchmark: {}
  }

  return new Promise((resolve, reject) => {
    getComposition()
      .then(composition => {
        const tickers = composition.map(asset => asset.ticker)

        getQuotes(tickers).then(quotes => {
          let weightedSum = 0

          composition.forEach(asset => {
            asset.quote = quotes.find(q => q.ticker === asset.ticker)
            weightedSum += asset.quote.delta * asset.allocation
            performance.assets.push(asset)
          })

          performance.delta = round(weightedSum / 10000)

          resolve(performance)
        })
      })
      .catch(reject)
  })
}

function getCompositionData () {
  return new Promise((resolve, reject) => {
    getComposition()
      .then(composition => {
        resolve(composition)
      })
      .catch(reject)
  })
}

function updatePerformanceImage () {
  console.log('Updating performance image...')

  return new Promise((resolve, reject) => {
    getPerformance()
      .then(performance => {
        // TODO: Save to DB
        fetchQuote('^BVSP')
          .then(b => {
            b.delta = round(
              ((b.price - b.previousClose) / b.previousClose) * 100
            )
            performance.benchmark = b

            const html = generatePerformaceHtmlTable(performance)
            nodeHtmlToImage({
              puppeteerArgs: {
                args: [
                  '--no-sandbox',
                  '--disable-setuid-sandbox'
                ]
              },
              output: './images/performance.png',
              html
            })
              .then(() => {
                console.log('The performance image was created successfully!')
                resolve()
              })
              .catch((error) => {
                console.log('Error', error)
                resolve(error)
              })
          })
          .catch(error => {
            console.error(error)
            reject(error)
          })
      })
      .catch(error => {
        console.error(error)
        reject(error)
      })
  })
}

function getPerformanceImage () {
  const path = 'images/performance.png'
  return new Promise((resolve, reject) => {
    try {
      console.log('Reading file:', path)
      if (fs.existsSync(path)) {
        const file = fs.readFileSync(path)
        console.log('File readed:', !!file, path)
        resolve(file)
      }
    } catch (error) {
      reject(error)
    }
  })
}

function updateCompositionImage () {
  console.log('Updating composition image...')

  return new Promise((resolve, reject) => {
    getCompositionData().then(composition => {
      const html = generateCompositionHtmlTable(composition)
      nodeHtmlToImage({
        puppeteerArgs: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        },
        output: './images/composition.png',
        html
      })
        .then(() => {
          console.log('The composition image was created successfully!')
          resolve()
        })
        .catch((error) => {
          console.log('Error', error)
          resolve(error)
        })
    }).catch(error => {
      console.error(error)
      reject(error)
    })
  })
}

function getCompositionImage () {
  const path = 'images/composition.png'
  return new Promise((resolve, reject) => {
    try {
      console.log('Reading file:', path)
      if (fs.existsSync(path)) {
        const file = fs.readFileSync(path)
        console.log('File readed:', !!file, path)
        resolve(file)
      }
    } catch (error) {
      reject(error)
    }
  })
}

function updateTickerDetailImage (c) {
  console.log('Updating tickers details image...')

  return new Promise((resolve, reject) => {
    const html = generateTickerDetailsHtmlTable(c)
    nodeHtmlToImage({
      puppeteerArgs: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      },
      output: `./images/tickers/${c.ticker}.png`,
      html
    })
      .then(() => {
        console.log(`The ticker ${c.ticker} image was created successfully!`)
        resolve()
      })
      .catch((error) => {
        console.log('Error', error)
        reject(error)
      })
  })
}

function getTickerDetailsImage (ticker) {
  const path = `images/tickers/${ticker}.png`
  return new Promise((resolve, reject) => {
    try {
      console.log('Reading file:', path)
      if (fs.existsSync(path)) {
        const file = fs.readFileSync(path)
        console.log('File readed:', !!file, path)
        resolve(file)
      }
    } catch (error) {
      reject(error)
    }
  })
}
function updateQuoteDetailImage (quote, asset) {
  console.log('Updating quote details image...')

  return new Promise((resolve, reject) => {
    const html = generateQuoteDetailsHtmlTable(quote, asset)
    nodeHtmlToImage({
      puppeteerArgs: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      },
      output: `./images/quotes/${asset.ticker}.png`,
      html
    })
      .then(() => {
        console.log(`The quote ${asset.ticker} image was created successfully!`)
        resolve()
      })
      .catch((error) => {
        console.log('Error', error)
        reject(error)
      })
  })
}

function getQuotesDetailsImage (ticker) {
  const path = `images/quotes/${ticker}.png`
  return new Promise((resolve, reject) => {
    try {
      console.log('Reading file:', path)
      if (fs.existsSync(path)) {
        const file = fs.readFileSync(path)
        console.log('File readed:', !!file, path)
        resolve(file)
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  getPerformance,
  updatePerformanceImage,
  getPerformanceImage,
  updateCompositionImage,
  getCompositionImage,
  updateTickerDetailImage,
  getTickerDetailsImage,
  updateQuoteDetailImage,
  getQuotesDetailsImage
}
