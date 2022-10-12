var express = require('express');
const bodyparser = require('body-parser')

var User = require('../models/user');

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
  User.create(req.body)
    .then((user) => {
      console.log('User added to the database ', user);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(user);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = router;
