const express = require('express');
const bodyParser = require('body-parser');

const { ObjectId } = require('mongodb')

const authenticate = require('../authenticate');

const cors = require('./cors');

const Projects = require('../models/project');

const projectRouter = express.Router();

projectRouter.use(bodyParser.json());

/**
* ALL PROJECTS ROUTER
*/
projectRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Projects.find(req.query)
            .populate('creator')
            .populate('devs')
            .populate('tasks.dev')
            .populate('tasks.comments.author')
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyManager, (req, res, next) => {
        req.body.creator = req.user._id;
        Projects.create(req.body)
            .then((project) => {
                console.log('Project Created ', project);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /projects');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
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
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST not supported by /:projectId');
    })
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported by /:projectId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
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
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.devs);
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyManager, (req, res, next) => {
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
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported by /:projectId/devs');
    })
    .delete(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE not supported by /:projectId/devs');
    });


projectRouter.route('/:projectId/devs/:userId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyManager, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                if (!project.devs.includes(req.params.userId)) {
                    const userId = ObjectId(req.params.userId);
                    project.devs.push(userId);
                    project.save()
                        .then((project) => {
                            Projects.findById(project._id)
                                .then((project) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(project);
                                })
                        }, (err) => next(err));
                } else {
                    err = new Error('User already added to the project!')
                    return next(err);
                }
            })
    });

/** 
* PROJECT -- ALL TASKS ROUTER
*/
projectRouter.route('/:projectId/tasks')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.tasks);
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
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
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported by /:projectId/tasks');
    })
    .delete(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE not supported by /:projectId/tasks');
    });

/**
 * PROJECT -- TASK.ID ROUTER
 */
projectRouter.route('/:projectId/tasks/:taskId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .populate('tasks.comments.author')
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(project.tasks.id(req.params.taskId))
            })
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST not supported by /:projectId/tasks/:taskId');
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
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
    .delete(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE not supported by /:projectId/tasks/:taskId');
    });

/**
 * PROJECT -- TASK.ID -- ALL DEVS
 */
projectRouter.route('/:projectId/tasks/:taskId/dev/:userId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.tasks.id(req.params.taskId).dev)
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyManager, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                if (project.devs.includes(req.params.userId) && !project.tasks.id(req.params.taskId).dev.includes(req.params.userId)) {
                    const userId = ObjectId(req.params.userId)
                    project.tasks.id(req.params.taskId).dev.push(userId);
                    project.save()
                        .then((project) => {
                            Projects.findById(project._id)
                                .then((project) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(project);
                                })
                        }, (err) => next(err));
                } else {
                    error = new Error('Developer is not associated with project!')
                    return next(error);
                }


            })
    })
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported by /:projectId/tasks/:taskId/dev');
    })
    .delete(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE not supported by /:projectId/tasks/:taskId/dev');
    });

/**
 * PROJECT -- TASK.ID -- ALL COMMENTS
 */
projectRouter.route('/:projectId/tasks/:taskId/comments')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .populate('tasks.comments.author')
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.tasks.id(req.params.taskId).comments)
            })
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
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
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT not supported by /:projectId/tasks/:taskId/comments');
    })
    .delete(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE not supported by /:projectId/tasks/:taskId/comments');
    });

/**
 * PROJECT -- TASK.ID -- COMMENT.ID
 */
projectRouter.route('/:projectId/tasks/:taskId/comments/:commentId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Projects.findById(req.params.projectId)
            .populate('tasks.comments.author')
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.tasks.id(req.params.taskId).comments.id(req.params.commentId));
            })
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST not supported by /:projectId/tasks/:taskId/comments/:commentId');
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
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
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyBothRoles, (req, res, next) => {
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