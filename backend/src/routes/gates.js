const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const router = express.Router();
const gateService = require('../services/gateService');

router.get('/:group/:service/:environment', (async (req, res) => {
    const isOpen = await gateService.isOpen(req.params.group, req.params.service, req.params.environment);
    if (isOpen === null) {
        res.status(404);
        res.send('Gate not found');
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

const enterGateSchema = {
    body: {
        queue: Joi.boolean(),
        ticketId: Joi.string()
    }
};

router.put('/enter/:group/:service/:environment', validate(enterGateSchema), (async (req, res) => {
    const {group, service, environment} = req.params;
    const queue = req.body.queue || false;
    const ticketId = req.body.ticketId || false;
    try {
        const result = await gateService.enterGate(group, service, environment, queue, ticketId);
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

module.exports = router;
