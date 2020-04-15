const emojiDelta = delta => delta > 0
  ? 'O fundo está atualmente subindo ⬆️'
  : delta < 0 ? 'O fundo está atualmente caindo ⬇️' : '⏺'

module.exports = emojiDelta
