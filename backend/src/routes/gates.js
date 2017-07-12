const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const router = express.Router();
const gateService = require('../services/gateService');
const sse = require('../routes/sse');

router.get('/', (async (req, res) => {
    const gate = await gateService.getAllGates();
    if (gate === null) {
        res.status(404);
        res.send('Gate not found');
    } else {
        res.status(200);
        res.json(gate);
    }
}));

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
        res.send('');
        await sse.notifyStateChange();
    } catch (error) {
        res.status(500);
        res.send(error);
    }
}));

const setGateSchema = {
    body: {
        state: Joi.any().valid(['open', 'closed']),
        message: Joi.string()
    }
};

router.put('/:group/:service/:environment', validate(setGateSchema), (async (req, res) => {
    const {group, service, environment} = req.params;
    const {state, message} = req.body;
    try {
        const result = await gateService.setGate(group, service, environment, state, message);
        if (result === null) {
            res.status(404);
            res.send('Gate not found');
        } else {
            res.status(204);
            res.send('');
            await sse.notifyStateChange();
        }
    } catch (error) {
        res.status(500);
        res.send(error);
    }
}));

router.delete('/:group/:service', (async (req, res) => {
    const {group, service} = req.params;
    try {
        const result = await gateService.deleteService(group, service);
        if (result === null) {
            res.status(404);
            res.json({status: 'error', message: `unknown service: ${group}/${service}`});
        } else {
            res.status(204);
            res.end();
            sse.notifyDeleteService(group, service);
        }
    } catch (error) {
        res.status(500);
        res.json({status: 'error', message: error.message});
    }
}));

module.exports = router;
