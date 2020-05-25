const express = require('express');
const router = express.Router();
const chatService = require('./chat.service');

// routes
router.post('/saveMessage', saveMessage);
router.get('/getMessages', getMessages);
router.get('/getUserMessages', getUserMessages);

module.exports = router;

function saveMessage(req, res, next) {
    chatService.saveMessage(req.headers['to'], req.headers['from'], req.headers['message'])
        .then((status) => {
            if (status) {
                res.json(status);
            } else {
                res.json({});
            }
        })
        .catch(err => console.log(err));
}

function getMessages(req, res, next) {
    chatService.getMessage(req.headers['to'], req.headers['from'])
        .then((message) => {
            if (message) {
                res.json(message);
            } else {
                res.json({});
            }
        })
        .catch(err => console.log(err));
}

function getUserMessages(req, res, next) {
    chatService.getUserMessages(req.headers['user'])
        .then((messages) => {
            if (messages) {
                res.json(messages);
            } else {
                res.json({});
            }
        })
        .catch(err => console.log(err));
}
