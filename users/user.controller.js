const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.get('/getByEmail', getByEmail);
router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);

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
