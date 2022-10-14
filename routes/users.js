var express = require('express');
const bodyparser = require('body-parser')
var passport = require('passport');
var authenticate = require('../authenticate');

const config = require('../config');

var User = require('../models/user');

var jwt = require('jsonwebtoken');

var router = express.Router();
/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.body.firstname || req.body.lastname) {
    User.find({ firstname: req.body.firstname, lastname: req.body.lastname, role: "developer" }).
      then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
      }, (err) => next(err))
      .catch((err) => next(err));
  } else {
    User.find({}).
      then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
      }, (err) => next(err))
      .catch((err) => next(err));
  }
});

router.post('/signup', (req, res, next) => {
  const token = jwt.sign(req.body.username, config.secretKey);
  User.register(new User({ username: req.body.username, confirmationCode: token }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({ err: err });
      } else {
        if (req.body.firstname)
          user.firstname = req.body.firstname;
        if (req.body.lastname)
          user.lastname = req.body.lastname;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Complete!' });
            authenticate.sendEmailVerification(req.body.firstname, req.body.username, token);
          });
        });
      }
    });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  if (req.user.verified) {
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
  } else {
    res.json({ status: "You did not verify your account!" })
  }
});


module.exports = router;
