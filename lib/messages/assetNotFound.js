const assetNotFound = asset => asset
  ? `🤔 Ativo "${asset}" não encontrado na carteira.`
  : '🤖 Especifique um ativo.'

module.exports = assetNotFound
