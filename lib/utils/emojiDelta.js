const emojiDelta = delta => delta > 0
  ? '⬆️'
  : delta < 0 ? '⬇️' : '⏺'

module.exports = emojiDelta
