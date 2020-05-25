const db = require('../_helpers/db');

module.exports = {
    saveMessage,
    getMessage,
};

async function saveMessage(to, fromE, message) {
    return await db.sendMessage(to, fromE, message);
}

async function getMessage(user1, user2) {
    return await db.getMessages(user1, user2);
}
