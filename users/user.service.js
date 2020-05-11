const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');

module.exports = {
    registerUser,
    getByEmail
};

async function registerUser(userParam) {
    // Replace the original password with a hash
    if (userParam.password) {
        userParam.password = bcrypt.hashSync(userParam.password, 10);
    }
    return await db.registerUser(
        userParam.email,
        userParam.password,
        userParam.name,
        userParam.role,
        userParam.phoneNumber,
        userParam.deliveryDirection
    );
}

async function getByEmail(userParam) {
    return await db.getUserByEmail(userParam.email);
}