const MongoClient = require('mongodb').MongoClient;
const url = require('../config/env-vars').db_url;

module.exports = {
    registerUser,
    getUserByEmail
};

async function registerUser(email, hashPass, name, role, phoneNumber, deliveryDirection) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    getUserByEmail(email).then((user) => {
                        if (Object.keys(user).length > 1) {
                            resolve({successful: 0});
                        } else {
                            MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
                                .then((db, err) => {
                                    if (err) throw err;
                                    const dbo = db.db("shopby");
                                    let user = {
                                        email: email,
                                        hashPass: hashPass,
                                        name: name,
                                        role: role,
                                        phoneNumber: phoneNumber,
                                        deliveryDirection: deliveryDirection
                                    };
                                    dbo.collection("users").insertOne(user, function (err, res) {
                                        if (err) throw err;
                                        resolve({successful: 1});
                                        db.close();
                                    });
                                });
                        }
                    });
                }
            });
    });


}

async function getUserByEmail(email) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    const query = { email: email };
                    dbo.collection("users").find(query).toArray(function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            if (result.length > 0) {
                                resolve(result[0]);
                            } else {
                                resolve({});
                            }
                        }
                    });
                }
            });
    });
}