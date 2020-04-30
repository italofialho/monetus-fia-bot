const isAdmin = (message) => message.from.id == process.env.BOT_ADMIN_ID;
const isPrivateMessage = (message) => message.chat.type === "private";

module.exports = { isAdmin, isPrivateMessage };
