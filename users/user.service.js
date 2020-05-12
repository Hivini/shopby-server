const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');

module.exports = {
    registerUser,
    getByEmail
};

async function registerUser(userParam) {
    if (userParam.email == null || userParam.email === '') {
        throw Error("Non a valid email");
    }
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

async function getByEmail(email) {
    return await db.getUserByEmail(email);
}