const fs = require('fs')
const nodeHtmlToImage = require('node-html-to-image')

const { getComposition } = require('./composition')
const { getQuotes, fetchQuote } = require('./quotes')
const { generateHtmlTable, round } = require('./utils')

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

            const html = generateHtmlTable(performance)
            nodeHtmlToImage({
              output: './images/performance.png',
              html
            })
              .then(() => {
                console.log('The image was created successfully!')
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
  return fs.createReadStream('images/performance.png')
}

module.exports = {
  getPerformance,
  updatePerformanceImage,
  getPerformanceImage
}
