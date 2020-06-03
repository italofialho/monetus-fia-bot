const isAdmin = (message) => message.from.id == process.env.BOT_ADMIN_ID;
const isMod = (message) => {
  const mods = String(process.env.BOT_MODERATORS_ID).split(",");
  return mods.indexOf(String(message.chat.id)) > -1;
};
const isPrivateMessage = (message) => message.chat.type === "private";

module.exports = { isAdmin, isPrivateMessage, isMod };
