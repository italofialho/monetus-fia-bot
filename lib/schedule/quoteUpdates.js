const { updateQuotes } = require('../quotes')
const {
  updatePerformanceImage,
  updateCompositionImage
} = require('../performance')

// God forgive me for what I'm about to do
function runUpdates () {
  updateQuotes()

  // Lazy man's "wait for SQLite to finish his shit"
  // (I don't even know the right way to do it)
  // TODO: Fix this once the we modularize db operations
  setTimeout(updatePerformanceImage, 5000)
  setTimeout(updateCompositionImage, 5000)
}

function scheduleQuoteUpdates () {
  // Run right away the first time
  runUpdates()

  // This runs every 5 minutes, a small, simple period, so no problem using
  // setInterval instead of the scheduler.
  setInterval(runUpdates, 60000 * 5)
}

module.exports = { scheduleQuoteUpdates, runUpdates }
