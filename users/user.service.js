const bcrypt = require('bcrypt');
const db = require('../_helpers/db');

module.exports = {
    registerUser,
    getByEmail,
    loginUser,
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

// This is not a secure logging. Use tokens instead, this is a quick project and time is lacking.
async function loginUser(email, password) {
    let user = await db.getUserByEmail(email);
    if (user) {
        if (bcrypt.compareSync(password, user.hashPass)) {
            console.log('User ' + email + ' logged in.');
            return {
                email: user.email,
                name: user.name,
                role: user.role,
                phoneNumber: user.phoneNumber,
                deliveryDirection: user.deliveryDirection,
            }
        }
    }
    return null;
}