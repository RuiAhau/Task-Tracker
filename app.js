var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');

var authenticate = require('./authenticate');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var projectRouter = require('./routes/projectRouter');
var confirmationRouter = require('./routes/confirmationRouter');

const mongoose = require('mongoose');

const serverUrl = 'mongodb://127.0.0.1:27017/taskTracker';
const connect = mongoose.connect(serverUrl)
  .then((db) => {
    console.log('Data base connected');
  }, (err) => {
    console.log(err);
  });

var app = express();

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    //Redirect to the secure port of the server
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/confirm', confirmationRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/projects', projectRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
