const db = require('../_helpers/db_handler');

module.exports = {
    saveMessage,
    getMessage,
    getUserMessages,
};

async function saveMessage(to, fromE, message) {
    return await db.sendMessage(to, fromE, message);
}

async function getMessage(user1, user2) {
    return await db.getMessages(user1, user2);
}

async function getUserMessages(user) {
    return await db.getUserMessages(user);
}
