var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');
const nodemailer = require('nodemailer');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
        if (err) {
            return done(err, false);
        } else if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyManager = (req, res, next) => {
    User.findOne({ _id: req.user._id })
        .then((user) => {
            if (user.role === 'manager') {
                next();
            } else {
                err = new Error('You are not a Manager to perform this operation!');
                err.status = 403;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err))
};

exports.verifyDeveloper = (req, res, next) => {
    User.findOne({ _id: req.user._id })
        .then((user) => {
            if (user.role === 'developer')
                next();
            else {
                err = new Error('You are not a Developer to perform this operation!');
                err.status = 403;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err))
};

exports.verifyBothRoles = (req, res, next) => {
    User.findOne({ _id: req.user._id })
        .then((user) => {
            if (user.role === 'manager' || user.role === 'developer')
                next();
            else {
                err = new Error('You are not a Dev or Manager to perform this operation!');
                err.status = 403;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err))
};

const transport = nodemailer.createTransport({
    service: "Hotmail",
    auth: {
        user: config.emailAuth.user,
        pass: config.emailAuth.pass
    }
});

exports.sendEmailVerification = (name, email, codeConfirmation) => {
    transport.sendMail({
        from: config.emailAuth.user,
        to: email,
        subject: 'Confirm your account',
        text: 'http://localhost:3000/confirm/' + codeConfirmation
    }).catch(err => console.log(err));
};