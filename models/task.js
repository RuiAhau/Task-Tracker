const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = require('./user');

const commentSchema = new Schema({
    comment: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const taskSchema = new Schema({
    status: {
        type: String,
        enum: ['waiting', 'implementation', 'verifying', 'releasing'],
        default: 'waiting',
        required: true
    },
    dev: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },
    comments: [commentSchema]
});

var Tasks = mongoose.model('Task', taskSchema);
var Comments = mongoose.model('Comment', commentSchema);

module.exports = Tasks;