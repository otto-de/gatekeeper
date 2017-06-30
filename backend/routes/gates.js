const express = require('express');
const router = express.Router();
const gateService = require('../services/gateService');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function (req, res) {
    console.dir(req.body);
    let {service, group, environments} = req.body;
    gateService.createGate(service, group, environments);
    res.send('Got a POST request');
});

module.exports = router;
