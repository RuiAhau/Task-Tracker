const express = require('express');
const bodyParser = require('body-parser');

const authenticate = require('../authenticate');

const Projects = require('../models/project');

const projectRouter = express.Router();

projectRouter.use(bodyParser.json());

/**
* ALL PROJECTS ROUTER
*/
projectRouter.route('/')
    .get(authenticate.verifyUser, (req, res, next) => {
        Projects.find({})
            .populate('creator')
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyManager, (req, res, next) => {
        req.body.creator = req.user._id;
        Projects.create(req.body)
            .then((project) => {
                console.log(req.body.creator)
                console.log('Project Created ', project);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /projects');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Projects.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

/**
* PROJECT ROUTER
*/
projectRouter.route('/:projectId')
    .get(authenticate.verifyUser, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST not supported by /:projectId');
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported by /:projectId');
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Projects.findByIdAndRemove(req.params.projectId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

/**
* PROJECT -- DEVS ROUTER
*/
projectRouter.route('/:projectId/devs')
    .get(authenticate.verifyUser, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.devs);
            })
    })
    .post(authenticate.verifyUser, authenticate.verifyManager, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                project.devs.push(req.body);
                project.save()
                    .then((project) => {
                        Projects.findById(project._id)
                            .then((project) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(project);
                            })
                    }, (err) => next(err));
            })
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported by /:projectId/devs');
    })
    .delete((req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE not supported by /:projectId/devs');
    });

/** 
* PROJECT -- ALL TASKS ROUTER
*/
projectRouter.route('/:projectId/tasks')
    .get(authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.tasks);
            })
    })
    .post(authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                project.tasks.push(req.body);
                project.save()
                    .then((project) => {
                        Projects.findById(project._id)
                            .then((project) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(project);
                            })
                    }, (err) => next(err));
            })
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported by /:projectId/tasks');
    })
    .delete((req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE not supported by /:projectId/tasks');
    });

/**
 * PROJECT -- TASK.ID ROUTER
 */
projectRouter.route('/:projectId/tasks/:taskId')
    .get(authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .populate('tasks.comments.author')
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(project.tasks.id(req.params.taskId))
            })
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST not supported by /:projectId/tasks/:taskId');
    })
    .put(authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                if (req.body.status) {
                    project.tasks.id(req.params.taskId).status = req.body.status
                }
                project.save()
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);
            })
    })
    .delete((req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE not supported by /:projectId/tasks/:taskId');
    });

/**
 * PROJECT -- TASK.ID -- ALL DEVS
 */
projectRouter.route('/:projectId/tasks/:taskId/dev')
    .get(authenticate.verifyUser, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.tasks.id(req.params.taskId).dev)
            })
    })
    .post(authenticate.verifyUser, authenticate.verifyManager, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                project.tasks.id(req.params.taskId).dev.push(req.body);
                project.save()
                    .then((project) => {
                        Projects.findById(project._id)
                            .then((project) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(project);
                            })
                    }, (err) => next(err));
            })
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported by /:projectId/tasks/:taskId/dev');
    })
    .delete((req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE not supported by /:projectId/tasks/:taskId/dev');
    });

/**
 * PROJECT -- TASK.ID -- ALL COMMENTS
 */
projectRouter.route('/:projectId/tasks/:taskId/comments')
    .get(authenticate.verifyUser, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .populate('tasks.comments.author')
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.tasks.id(req.params.taskId).comments)
            })
    })
    .post(authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                req.body.author = req.user._id;
                project.tasks.id(req.params.taskId).comments.push(req.body);
                project.save()
                    .then((project) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(project);
                    })
            })
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported by /:projectId/tasks/:taskId/comments');
    })
    .delete((req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE not supported by /:projectId/tasks/:taskId/comments');
    });

/**
 * PROJECT -- TASK.ID -- COMMENT.ID
 */
projectRouter.route('/:projectId/tasks/:taskId/comments/:commentId')
    .get(authenticate.verifyUser, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .populate('tasks.comments.author')
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.tasks.id(req.params.taskId).comments.id(req.params.commentId));
            })
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST not supported by /:projectId/tasks/:taskId/comments/:commentId');
    })
    .put(authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                if (req.body.comment) {
                    project.tasks.id(req.params.taskId).
                        comments.id(req.params.commentId).comment = req.body.comment;
                }
                project.save()
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);
            })
    })
    .delete(authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                project.tasks.id(req.params.taskId).comments.id(req.params.commentId).remove()
                project.save()
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);
            })
    })

module.exports = projectRouter;