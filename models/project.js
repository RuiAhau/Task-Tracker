const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = require('./user');
const taskSchema = require('./task');

const projectSchema = new Schema({
    projectName: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    devs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },
    tasks: {
        type: [taskSchema.schema]
    }
});

var Projects = mongoose.model('Project', projectSchema);

module.exports = Projects;