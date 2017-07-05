const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const router = express.Router();
const gateService = require('../services/gateService');

router.get('/:group/:service/:environment', (async (req, res) => {
    const {group, service, environment} = req.params;
    const gate = await gateService.findGate(group, service, environment);
    if (gate === null) {
        res.status(404);
        res.send('Gate not found');
    } else {
        res.status(200);
        res.json(gate);
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
        const result = await gateService.setGateState(group, service, environment, open);
        if (result === null) {
            res.status(404);
            res.send('Gate not found');
        } else {
            res.status(200);
            res.json(result);
        }
    } catch (error) {
        res.status(500);
    }
}));

router.delete('/:group/:service', (async (req, res) => {
    const {group, service} = req.params;
    try {
        const result = await gateService.deleteService(group, service);
        if (result === null) {
            res.status(404);
            res.send('Service not found');
        } else {
            res.status(204);
            res.json(result);
        }
    } catch (error) {
        res.status(500);
    }
}));

module.exports = router;
