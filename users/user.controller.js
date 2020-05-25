const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);
router.post('/addUserHistory', addUserHistory);
router.get('/getByEmail', getByEmail);
router.get('/getStatistics', getStatistics);
router.get('/getUserHistory', getUserHistory);

module.exports = router;

function registerUser(req, res, next) {
    userService.registerUser(req.body)
        .then((status) => res.json(status))
        .catch(err => {
            console.log(err);
            res.json({successful: 0});
        });
}

function loginUser(req, res, next) {
    userService.loginUser(req.headers['email'], req.headers['password'])
        .then((user) => {
            if (user) {
                res.json(user);
            } else {
                res.json({});
            }
        })
        .catch(err => console.log(err));
}

function getByEmail(req, res, next) {
    userService.getByEmail(req.headers['email'])
        .then((user) => {
            if (user) {
                res.json(user);
            } else {
                res.json({});
            }
        })
        .catch(err => console.log(err));
}

// Putting this here because I am lazy to create another controller + service.
function getStatistics(req, res, next) {
    userService.getStatistics()
        .then((stats) => {
            if (stats) {
                res.json(stats);
            } else {
                res.json({});
            }
        })
        .catch(err => console.log(err));
}

function getUserHistory(req, res, next) {
    userService.getUserBuyHistory(req.headers['email'])
        .then((stats) => {
            if (stats) {
                res.json(stats);
            } else {
                res.json({});
            }
        })
        .catch(err => console.log(err));
}

function addUserHistory(req, res, next) {
    userService.addUserBuyHistory(req.headers['email'], req.headers['title'], req.headers['vendor'], req.headers['price'])
        .then((status) => {
            res.json(status);
        })
        .catch(err => console.log(err));
}