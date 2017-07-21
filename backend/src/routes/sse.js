const router = require('express').Router();
const sse = require('../helper/sse-client');
const gateService = require('../services/gateService');
const uuidv4 = require('uuid/v4');

let connections = [];

router.get('/', async (req, res) => {
    sse(req, res);
    const id = uuidv4();
    connections.push({id, res});
    console.log('new connection: ' + id);
    res.sse.sendEvent('state', await gateService.getAllGates());
    req.connection.on('close', () => {
        console.log('remove closed connection: ' + id);
        connections = connections.filter((con) => con.id !== id)
    });
});

function send(event, message) {
    connections.forEach(con => {
        console.log('notify connection: ' + con.id);
        con.res.sse.sendEvent(event, message)
    });
}

async function notifyStateChange() {
    const gates = await gateService.getAllGates();
    send('state', gates);
}

function notifyDeleteService(group, service) {
    send('deleteService', {group, service});
}

async function notifyUpdateGates(group, service, environments) {
    environments.forEach(async env => {
        return await notifyUpdateGate(group, service, env);
    });
}

async function notifyUpdateGate(group, service, environment) {
    const gate = await gateService.findGate(group, service, environment);
    send('updateGate', {group, service, environment, gate});
}

module.exports = { router, notifyStateChange, notifyDeleteService, notifyUpdateGate, notifyUpdateGates };