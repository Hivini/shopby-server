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
    addRatingsToProduct,
};

/*
    Parameters:
    email -> User email
    hashPass -> Hash resulted by processing the user password
    name -> Name of the user
    phoneNumber -> Phone Number of the user
    deliveryDirection -> Delivery Direction of the user

    Registers the user in the database.
 */
async function registerUser(email, hashPass, name, role, phoneNumber, deliveryDirection) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    getUserByEmail(email).then((user) => {
                        if (Object.keys(user).length > 1) {
                            // If a user already exists return a not successful message.
                            resolve({successful: 0});
                        } else {
                            MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
                                .then((db, err) => {
                                    if (err) throw err;
                                    // Get the database
                                    const dbo = db.db("shopby");
                                    // Setup the user to be added to the database.
                                    let user = {
                                        email: email,
                                        hashPass: hashPass,
                                        name: name,
                                        role: role,
                                        phoneNumber: phoneNumber,
                                        deliveryDirection: deliveryDirection
                                    };
                                    // Insert the user into the database and return a success message.
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

/*
    Parameters:
    email -> User email to search for.

    Gets the user information.
 */
async function getUserByEmail(email) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    const query = { email: email };
                    // Get the user and transform it into an array to verify if we have more than one.
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

/*
    Parameters:
    email -> Email of the user that registers the product.
    title -> The title of the product.
    description -> Description of the product.
    price -> Price of the product.
    imageUrl -> Url of the image to be shown with the product.

    Register the product in the database.
 */
async function registerProduct(email, title, description, price, imageUrl) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    // Get the user that registers the product, if it doesn't exists, then return an unsuccessful register.
                    getUserByEmail(email).then((user) => {
                        if (Object.keys(user).length < 2) {
                            resolve({successful: 0});
                        } else {
                            MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
                                .then((db, err) => {
                                    if (err) throw err;
                                    const dbo = db.db("shopby");
                                    // Create the object that it's going to be sent to the database.
                                    // The price is needed to be parsed from the user and the rating and totalRatings
                                    // starts at 0.
                                    let product = {
                                        user: {
                                            email: user.email,
                                            hashPass: user.hashPass,
                                            name: user.name,
                                            role: user.role,
                                            phoneNumber: user.phoneNumber,
                                            deliveryDirection: user.deliveryDirection
                                        },
                                        title: title,
                                        description: description,
                                        price: parseFloat(price),
                                        imageUrl: imageUrl,
                                        rating: 0,
                                        totalRatings: 0,
                                    };
                                    // Insert the one product and return a successful message.
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

/*
    Parameters:
    email -> Email of the user whose products are being looked for.

    Returns all the products of the user.
 */
async function getAllProductsByUser(email) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    const query = { "user.email": email };
                    // Find the products registered by the user. Return an empty object if none are found.
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

/*
    Parameters:
    id -> Object ID of the product.

    Returns if the deletion was successful or not.
 */
async function deleteProduct(id) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    // Create a new MongoDB ObjectID no match on the database.
                    const query = { _id: new mongodb.ObjectID(id) };
                    // Get the product information with the ID to check if it exists.
                    getProductById(id).then((product) => {
                        // If it's not empty delete it.
                        if (Object.keys(product).length > 1) {
                            dbo.collection("products").deleteOne(query, function(err, result) {
                                if (err) {
                                    reject(err);
                                }
                                // Send an email to the user.
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

/*
    Parameters:
    id -> The ID of the product.

    Returns the product information.
 */
async function getProductById(id) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    // Creates and ObjectID to match with the database.
                    const query = { _id: new mongodb.ObjectID(id) };
                    dbo.collection("products").findOne(query, function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            // If the product exist return it, else return an empty object.
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

/*
    Parameters:
    id -> ID of the product being rated.
    rating -> Rating to put on the product between 1 and 5.

    Add a rating to the product and return a successful message if the product exists.
 */
async function addRatingsToProduct(id, rating) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    // Get the product to check if it exists.
                    getProductById(id).then((product) => {
                        if (product !== {}) {
                            let dbo = db.db('shopby');
                            // Create the ObjectID to look for the product.
                            const query = { _id: new mongodb.ObjectID(id) };
                            // Add one to the ratings number and add to the total sum the rating of the user.
                            const newValue = { $set: {'rating': product['rating'] + 1, 'totalRatings': product['totalRatings'] + parseInt(rating)}};
                            // Update the change in the database.
                            dbo.collection("products").updateOne(query, newValue, function (err, res) {
                                if (err) throw err;
                                resolve({'successful': 1});
                                db.close();
                            })
                        }
                    });
                }
            });
    });
}

/*
    Parameters:
    search -> The keywords that are used to search in the product title and description.

    Returns the products that match with the search.
*/
async function getProductsMatch(search) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    // Prepare the query to search in the text indexes.
                    const query = { $text: { $search: search } };
                    dbo.collection("products").find(query).toArray(function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            if (result.length > 0) {
                                // Return the list of matched products
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

/*
    Parameters:
    user1 -> Email of one of the users
    user2 -> Email of the other user

    Return the messages that match with both users.
 */
async function getMessages(user1, user2) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    // Search for the messages that matches with the two users and order it by timestamp, to get them
                    // in chronological order.
                    const query = { $query: { users: { $all: [user1, user2] } }, $orderby: {'messages.timestamp': -1}};
                    dbo.collection("messages").findOne(query, function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            // If the messages exist return them. Otherwise return an empty object.
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

/*
    Parameters:
    user -> User Email.

    Returns the messages in which the user participates.
 */
async function getUserMessages(user) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    // Get the message where the user participates in, in chronological order.
                    const query = { $query: { users: user }, $orderby: {'messages.timestamp': -1}};
                    dbo.collection("messages").find(query).toArray( function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            // Return the messages, if there aren't any, return an empty object.
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

/*
    Parameters:
    to -> Email of the user who receives the message
    fromE -> Email of the user who sends the message
    message -> Message to be sent

    Return a successful messages if it was added to the database
 */
async function sendMessage(to, fromE, message) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    // See if it's the first message between two users or if they had a previous chat.
                    getMessages(to, fromE).then((messages) => {
                        // if it exists add message to the previous messages
                        if (Object.keys(messages).length > 1) {
                            MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
                                .then((db, err) => {
                                    if (err) throw err;
                                    const dbo = db.db("shopby");
                                    let previousMessages = messages['messages'];
                                    // Add the new message with the timestamp of this moment.
                                    previousMessages.push({ 'from': fromE, 'message': message, 'timestamp': Date.now()});
                                    // Query to find the message where both users interact.
                                    const query = { users: { $all: [to, fromE] } };
                                    // Set the messages with the new added value.
                                    const newValue = { $set: {'messages': previousMessages}};
                                    // Update the registry.
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
                                    // Create a new object message with the timestamp of this moment.
                                    let newMessage = {
                                        users: [to, fromE],
                                        messages: [{
                                            'from': fromE,
                                            'message': message,
                                            'timestamp': Date.now()
                                        }]
                                    };
                                    // Insert the new message and return a successful message.
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

/*
    Returns the total number of products in the database.
 */
async function getProductCount() {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    // Counts the number of documents in the product collection.
                    dbo.collection("products").countDocuments()
                        .then(count => resolve(count));
                }
            });
    });
}

/*
    Returns the number users in the database.
 */
async function getUserCount() {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    // Counts the numebr of documents in the user collection.
                    dbo.collection("users").countDocuments()
                        .then(count => resolve(count));
                }
            });
    });
}

/*
    Returns the number of chats in the database.
 */
async function getMessageCount() {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    // Counts the number of documents in the messages collection.
                    dbo.collection("messages").countDocuments()
                        .then(count => resolve(count));
                }
            });
    });
}

/*
    Parameters:
    email -> Email of the user that buys the product.
    title -> Title of the product bought.
    vendor -> Email of the vendor of the product.
    Price -> Price of the product.
 */
async function addUserBuyHistory(email, title, vendor, price) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    // Verify if the user exists.
                    getUserByEmail(email).then((user) => {
                        if (Object.keys(user).length < 2) {
                            resolve({successful: 0});
                        } else {
                            MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
                                .then((db, err) => {
                                    if (err) throw err;
                                    const dbo = db.db("shopby");
                                    // Create the new history field with the time of now.
                                    let history = {
                                        timestamp: Date.now(),
                                        email: email,
                                        title: title,
                                        vendor: vendor,
                                        price: parseFloat(price)
                                    };
                                    // Insert on the history collection and return a successful message.
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

/*
    Parameters:
    email -> Email of the user whose buy history is getting.

    Returns the list of products bought by the user.
 */
async function getUserBuyHistory(email) {
    return new Promise(function(resolve, reject) {
        MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true})
            .then((db, err) => {
                if (err) {
                    reject(err);
                } else {
                    let dbo = db.db('shopby');
                    // Search for the matches on the email of the user and order the result in chronological order.
                    const query = { $query: { email: email }, $orderby: {'timestamp': -1}};
                    dbo.collection("history").find(query).toArray( function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            // If there is buy history return the fields, otherwise return an empty object.
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
