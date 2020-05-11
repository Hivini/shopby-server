const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// routes
router.get('/getByEmail', getByEmail);
router.post('/registerUser', registerUser);

module.exports = router;

function registerUser(req, res, next) {
    userService.registerUser(req.body)
        .then((status) => res.json(status))
        .catch(err => console.log(err));
}

function getByEmail(req, res, next) {
    userService.getByEmail(req.body)
        .then((user) => {
            if (user) {
                res.json(user);
            } else {
                res.json({});
            }
        })
        .catch(err => console.log(err));
}
