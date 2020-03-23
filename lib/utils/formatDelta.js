const formatNumber = require('./formatNumber')
const formatDelta = delta =>
  delta > 0
    ? `+${formatNumber(delta)}%`
    : `${formatNumber(delta)}%`

module.exports = formatDelta
