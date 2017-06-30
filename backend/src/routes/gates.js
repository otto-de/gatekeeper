const express = require('express');
const router = express.Router();
const gateService = require('../services/gateService');

router.get('/:group/:service/:environment', function (req, res) {
    res.send(req.params);
    gateService.isOpen(req.params.group, req.params.service, req.params.environment);
    res.status(200);
    res.send('Got a GET request');
});

router.post('/', function (req, res) {
    let {service, group, environments} = req.body;
    console.log("Calling createOrUpdateService");
    gateService.createOrUpdateService(service, group, environments);
    res.status(201);
    res.send('Got a POST request');
});

module.exports = router;
