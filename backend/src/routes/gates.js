const express = require('express');
const router = express.Router();
const gateService = require('../services/gateService');

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.post('/', function (req, res) {
    console.dir(req.body);
    let {service, group, environments} = req.body;
    console.log("Calling createGate");
    gateService.createGate(service, group, environments);
    res.status(201);
    res.send('Got a POST request');

});

module.exports = router;
