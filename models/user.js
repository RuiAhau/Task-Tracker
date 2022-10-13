const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//const roles = require('../enumRoles');

var User = new Schema({
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

    }
});

var User = mongoose.model('User', User);

module.exports = User;