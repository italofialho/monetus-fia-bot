function parseTime (str) {
  if(!str) return "";

  const parsed = String(str).trim().split(':')

  return { hour: parseInt(parsed[0]), minute: parseInt(parsed[1]) }
}

const stockExchange = {
  operationHours: {
    openTime: parseTime(process.env.STOCK_EXCHANGE_OPEN_TIME),
    marketCloseTime: parseTime(process.env.STOCK_EXCHANGE_MARKET_CLOSE_TIME),
    afterMarketCloseTime: parseTime(process.env.STOCK_EXCHANGE_AFTER_MARKET_CLOSE_TIME)
  }
}

module.exports = stockExchange
