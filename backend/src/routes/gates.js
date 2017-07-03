const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const router = express.Router();
const gateService = require('../services/gateService');

router.get('/:group/:service/:environment', (async (req, res) => {
    const isOpen = await gateService.isOpen(req.params.group, req.params.service, req.params.environment);
    res.status(200);
    res.json({open: isOpen});
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

module.exports = router;
