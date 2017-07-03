const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const router = express.Router();
const gateService = require('../services/gateService');

router.get('/:group/:service/:environment', (async (req, res) => {
    const isOpen = await gateService.isOpen(req.params.group, req.params.service, req.params.environment);
    if (isOpen === null) {
        res.status(404);
        res.send('Gate does not exist');
    } else {
        res.status(200);
        res.json({open: isOpen});
    }
}));

const createOrUpdateServiceSchema = {
    body: {
        service: Joi.string().required(),
        group: Joi.string().required(),
        environments: Joi.array().items(Joi.string()).min(1).unique().required()
    }
};

router.post('/', validate(createOrUpdateServiceSchema), (async (req, res) => {
    let {service, group, environments} = req.body;
    try {
        await gateService.createOrUpdateService(group, service, environments);
        res.status(201);
        res.send('Got a POST request');
    } catch (error) {
        res.status(500);
    }
}));

const setGateSchema = {
    body: {
        open: Joi.boolean().required()
    }
};

router.put('/:group/:service/:environment', validate(setGateSchema), (async (req, res) => {
    const {group, service, environment} = req.params;
    const {open} = req.body;
    try {
        const result = await gateService.setGate(group, service, environment, open);
        res.status(200);
        res.json(result);
    } catch (error) {
        res.status(500);
    }
}));

module.exports = router;
