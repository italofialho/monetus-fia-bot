const isAdmin = (message) => {
  console.log(
    "isAdmin",
    message.from.id,
    message.from.id == process.env.BOT_ADMIN_ID
  );
  return message.from.id == process.env.BOT_ADMIN_ID;
};

const isPrivateMessage = (message) => message.chat.type === "private";

module.exports = { isAdmin, isPrivateMessage };
