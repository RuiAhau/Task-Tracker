const express = require('express');
const bodyParser = require('body-parser');

const Projects = require('../models/project');
const User = require('../models/user');

const projectRouter = express.Router();

projectRouter.use(bodyParser.json());

projectRouter.route('/')
    .get((req, res, next) => {
        Projects.find({})
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Projects.create(req.body)
            .then((project) => {
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
    .delete((req, res, next) => {
        Projects.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

projectRouter.route('/:projectId')
    .get((req, res, next) => {
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
    .delete((req, res, next) => {
        Projects.findByIdAndRemove(req.params.projectId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });

projectRouter.route('/:projectId/tasks')
    .get((req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.tasks);
            })
    })
    .post((req, res, next) => {
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


projectRouter.route('/:projectId/tasks/:taskId')
    .get((req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json')
                res.json(project.tasks.id(req.params.taskId))
            })
    })
    .post((req, res, next) => {
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

// TODO PUT AND DELETE


projectRouter.route('/:projectId/devs')
    .get((req, res, next) => {
        Projects.findById(req.params.projectId)
            .then((project) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(project.devs);
            })
    })
    .post((req, res, next) => {
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

// TODO PUT AND DELETE



module.exports = projectRouter;