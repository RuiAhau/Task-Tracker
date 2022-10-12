const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        default: 'developer',
        required: true
    }
});

var User = mongoose.model('User', User);

module.exports = User;