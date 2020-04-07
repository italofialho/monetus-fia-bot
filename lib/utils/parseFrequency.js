const parseFrequency = (frequency) =>
  ({
    daily: 'diárias',
    hourly: 'de hora em hora'
  }[frequency] || parseFrequency('daily'))

module.exports = parseFrequency
