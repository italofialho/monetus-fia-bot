const formatNumber = value =>
  value
    ? Number(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    : value

module.exports = formatNumber
