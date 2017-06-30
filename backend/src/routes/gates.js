const express = require('express');
const router = express.Router();
const gateService = require('../services/gateService');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.post('/', function (req, res) {
    let {service, group, environments} = req.body;
    console.log("Calling createOrUpdateService");
    gateService.createOrUpdateService(service, group, environments);
    res.status(201);
    res.send('Got a POST request');
});

module.exports = router;
