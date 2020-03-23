const formatNumber = require('./formatNumber')
const toReal = value => value ? formatNumber(value).toLocaleString('pt-BR', {
  minimumFractionDigits: 2, maximumFractionDigits: 2, style: 'currency', currency: 'BRL'
}) : value

module.exports = toReal
