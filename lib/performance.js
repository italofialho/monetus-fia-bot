const fs = require('fs')
const nodeHtmlToImage = require('node-html-to-image')

const { getComposition } = require('./composition')
const { getQuotes, fetchQuote } = require('./quotes')
const { generatePerformaceHtmlTable, generateCompositionHtmlTable, generateTickerDetailsHtmlTable, round } = require('./utils')

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
  return fs.createReadStream('images/performance.png')
}

function updateCompositionImage () {
  console.log('Updating composition image...')

  return new Promise((resolve, reject) => {
    getCompositionData().then(composition => {
      const html = generateCompositionHtmlTable(composition)
      nodeHtmlToImage({
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
  return fs.createReadStream('images/composition.png')
}

function updateTickerDetailImage (c) {
  console.log('Updating tickers details image...')

  return new Promise((resolve, reject) => {
    const html = generateTickerDetailsHtmlTable(c)
    nodeHtmlToImage({
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
  return fs.createReadStream(`images/tickers/${ticker}.png`)
}

module.exports = {
  getPerformance,
  updatePerformanceImage,
  getPerformanceImage,
  updateCompositionImage,
  getCompositionImage,
  updateTickerDetailImage,
  getTickerDetailsImage
}
