const mailer = require('./mailer');
const MongoClient = require('mongodb').MongoClient;
const mongodb = require('mongodb');
const url = require('../config/env-vars').db_url;

module.exports = {
    registerUser,
    getUserByEmail,
    getAllProductsByUser,
    registerProduct,
    deleteProduct,
    getProductsMatch,
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

async function registerProduct(email, title, description, price, imageUrl) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    getUserByEmail(email).then((user) => {
                        if (Object.keys(user).length < 2) {
                            resolve({successful: 0});
                        } else {
                            MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
                                .then((db, err) => {
                                    if (err) throw err;
                                    const dbo = db.db("shopby");
                                    let product = {
                                        user: user,
                                        title: title,
                                        description: description,
                                        price: parseInt(price),
                                        imageUrl: imageUrl,
                                        rating: 0,
                                        totalRatings: 0,
                                    };
                                    dbo.collection("products").insertOne(product, function (err, res) {
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

async function getAllProductsByUser(email) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    const query = { "user.email": email };
                    dbo.collection("products").find(query).toArray(function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            if (result.length > 0) {
                                resolve(result);
                            } else {
                                resolve({});
                            }
                        }
                    });
                }
            });
    });
}

async function deleteProduct(id) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    const query = { _id: new mongodb.ObjectID(id) };
                    getProductById(id).then((product) => {
                        if (Object.keys(product).length > 1) {
                            dbo.collection("products").deleteOne(query, function(err, result) {
                                if (err) {
                                    reject(err);
                                }
                                mailer.sendEmail(product.user.email, product.title);
                                resolve({successful: 1});
                            });
                        } else {
                            resolve({successful: 0});
                        }
                    });
                }
            });
    });
}

async function getProductById(id) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    const query = { _id: new mongodb.ObjectID(id) };
                    dbo.collection("products").findOne(query, function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            if (result != null) {
                                resolve(result);
                            } else {
                                resolve({});
                            }
                        }
                    });
                }
            });
    });
}

async function getProductsMatch(search) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    const query = { $text: { $search: search } };
                    dbo.collection("products").find(query).toArray(function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            if (result.length > 0) {
                                resolve(result);
                            } else {
                                resolve({});
                            }
                        }
                    });
                }
            });
    });
}
