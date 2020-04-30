
const getFirstNameOrUserName = data =>
data.username
    ? `@${data.username}`
    : `*${data.first_name}*`

module.exports = getFirstNameOrUserName
