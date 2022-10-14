const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

var User = require('../models/user');

const confirmationRouter = express.Router();

confirmationRouter.use(bodyParser.json());

confirmationRouter.get('/:confirmationCode', function (req, res, next) {
    User.findOne({
        codeConfirmation: req.params.confirmationCode
    })
        .then((user) => {
            user.verified = true;
            user.save()
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(user);
        })
});

module.exports = confirmationRouter;