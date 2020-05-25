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
    sendMessage,
    getMessages,
    getUserMessages,
    getProductCount,
    getUserCount,
    getMessageCount,
    addUserBuyHistory,
    getUserBuyHistory,
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

async function getMessages(user1, user2) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    const query = { $query: { users: { $all: [user1, user2] } }, $orderby: {'messages.timestamp': -1}};
                    dbo.collection("messages").findOne(query, function(err, result) {
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

async function getUserMessages(user) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    const query = { $query: { users: user }, $orderby: {'messages.timestamp': -1}};
                    dbo.collection("messages").find(query).toArray( function(err, result) {
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

async function sendMessage(to, fromE, message) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    getMessages(to, fromE).then((messages) => {
                        if (Object.keys(messages).length > 1) {
                            MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
                                .then((db, err) => {
                                    if (err) throw err;
                                    const dbo = db.db("shopby");
                                    let previousMessages = messages['messages'];
                                    previousMessages.push({ 'from': fromE, 'message': message, 'timestamp': Date.now()});
                                    const query = { users: { $all: [to, fromE] } };
                                    const newValue = { $set: {'messages': previousMessages}};
                                    dbo.collection("messages").updateOne(query, newValue, function (err, res) {
                                        if (err) throw err;
                                        resolve({'successful': 1});
                                        db.close();
                                    })
                                });
                        } else {
                            MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
                                .then((db, err) => {
                                    if (err) throw err;
                                    const dbo = db.db("shopby");
                                    let newMessage = {
                                        users: [to, fromE],
                                        messages: [{
                                            'from': fromE,
                                            'message': message,
                                            'timestamp': Date.now()
                                        }]
                                    };
                                    dbo.collection("messages").insertOne(newMessage, function (err, res) {
                                        if (err) throw err;
                                        resolve({'successful': 1});
                                        db.close();
                                    })
                                });
                        }
                    });
                }
            });
    });
}

async function getProductCount() {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    dbo.collection("products").countDocuments()
                        .then(count => resolve(count));
                }
            });
    });
}

async function getUserCount() {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    dbo.collection("users").countDocuments()
                        .then(count => resolve(count));
                }
            });
    });
}

async function getMessageCount() {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    dbo.collection("messages").countDocuments()
                        .then(count => resolve(count));
                }
            });
    });
}

async function addUserBuyHistory(email, title, vendor, price) {
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
                                    let history = {
                                        timestamp: Date.now(),
                                        email: email,
                                        title: title,
                                        vendor: vendor,
                                        price: parseInt(price)
                                    };
                                    dbo.collection("history").insertOne(history, function (err, res) {
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

async function getUserBuyHistory(email) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    const query = { $query: { email: email }, $orderby: {'timestamp': -1}};
                    dbo.collection("history").find(query).toArray( function(err, result) {
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
