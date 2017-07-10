const router = require('express').Router();
const sse = require('../helper/sse-client');
const gateService = require('../services/gateService');

const connections = [];

router.get('/', async (req, res) => {
    sse(req, res);
    connections.push(res);
    res.sse.sendEvent('state', await gateService.getAllGates());
    res.sse.addListener('close', ()=> console.log("everything is closed -_+"))
});

async function notifyStateChange() {
    const gates = await gateService.getAllGates();
    connections.forEach(res => {
        res.sse.sendEvent('state', gates)
    });
}

module.exports = { router, notifyStateChange };