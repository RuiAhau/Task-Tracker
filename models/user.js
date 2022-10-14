var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    //EMAIL(UNIQUE) AND PASSWORD ADDED BY DEFAULT WHEN SIGNING UP
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['manager', 'developer'],
        default: 'developer',
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    confirmationCode: {
        type: String,
        unique: true
    }
});

User.plugin(passportLocalMongoose);

var User = mongoose.model('User', User);

module.exports = User;