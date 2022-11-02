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
},
    {
        timestamps: true
    });

const taskSchema = new Schema({
    taskName: {
        type: String,
        required: true
    },
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
    progress: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0.0,
        required: true
    },
    description: {
        type: String,
        default: '',
        required: true
    },
    comments: [commentSchema]
},
    {
        timestamps: true
    }
);

var Tasks = mongoose.model('Task', taskSchema);
var Comments = mongoose.model('Comment', commentSchema);

module.exports = Tasks;