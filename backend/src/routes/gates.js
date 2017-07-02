const express = require('express');
validate = require('express-validation');
const Joi = require('joi');
const router = express.Router();
const gateService = require('../services/gateService');

router.get('/:group/:service/:environment', function (req, res) {
    res.send(req.params);
    gateService.isOpen(req.params.group, req.params.service, req.params.environment);
    res.status(200);
    res.send('Got a GET request');
});

const createOrUpdateServiceSchema = {
    body: {
        service: Joi.string().required(),
        group: Joi.string().required(),
        environments: Joi.array().items(Joi.string()).min(1).unique().required()
    }
};

router.post('/', validate(createOrUpdateServiceSchema), function (req, res) {
    let {service, group, environments} = req.body;
    gateService.createOrUpdateService(service, group, environments);
    res.status(201);
    res.send('Got a POST request');
});

module.exports = router;
