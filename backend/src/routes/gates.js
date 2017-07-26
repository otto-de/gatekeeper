const express = require('express');
const validate = require('express-validation');
const Joi = require('joi');
const router = express.Router();
const gateService = require('../services/gateService');
const sse = require('../routes/sse');

/**
 * @swagger
 * tags:
 *   name: Gates
 *   description: Gates management
 */

/**
 * @swagger
 * definitions:
 *
 *   GateContainer:
 *     required:
 *       - gates
 *     properties:
 *       gates:
 *         $ref: '#/definitions/Groups'
 *     example:
 *       gates:
 *         myGroupName:
 *           myServiceName:
 *             myEnv1:
 *               state: 'open'
 *               message: 'comment about gate'
 *             myEnv2:
 *               state: 'closed'
 *               message: 'cause of the state'
 *   Groups:
 *     type: object
 *     description: map of all groups
 *     additionalProperties:
 *       $ref: '#/definitions/Services'
 *
 *   Services:
 *     type: object
 *     description: map of all services under a group
 *     additionalProperties:
 *       $ref: '#/definitions/Enironments'
 *
 *   Enironments:
 *     type: object
 *     description: map of all gates for a service under a specific group
 *     additionalProperties:
 *       $ref: '#/definitions/Gate'
 *
 *   Gate:
 *     type: object
 *     description: a gate
 *     properties:
 *       queue:
 *         type: array
 *         items:
 *           type: string
 *       auto_state:
 *         type: string
 *       state:
 *         type: string
 *       state_timestamp:
 *         type: integer
 *       message:
 *         type: string
 *       message_timestamp:
 *         type: integer
 */

/**
 * @swagger
 * /gates:
 *   get:
 *     description: Returns gates
 *     tags:
 *      - Gates
 *     produces:
 *      - application/json
 *     responses:
 *       200:
 *         description: gates
 *         schema:
 *           type: object
 *           $ref: '#/definitions/GateContainer'
 *       404:
 *         description: no gates found
 */
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

router.post('/', validate(createOrUpdateServiceSchema), async (req, res) => {
    let {service, group, environments} = req.body;
    try {
        await gateService.createOrUpdateService(group, service, environments);
        res.status(204);
        res.end();
        await sse.notifyUpdateGates(group, service, environments);
    } catch (error) {
        res.status(500);
        res.json({status: 'error', message: error.message});
    }
});

const setGateSchema = {
    body: {
        state: Joi.any().valid(['open', 'closed']),
        message: Joi.string().allow('')
    }
};

router.put('/:group/:service/:environment', validate(setGateSchema), async (req, res) => {
    const {group, service, environment} = req.params;
    const {state, message} = req.body;
    try {
        const result = await gateService.setGate(group, service, environment, state, message);
        if (result === null) {
            res.status(404);
            res.json({status: 'error', message: `unknown gate: ${group}/${service}/${environment}`});
        } else {
            res.status(204);
            res.end();
            await sse.notifyUpdateGate(group, service, environment);
        }
    } catch (error) {
        res.status(500);
        res.send({status: 'error', message: error.message});
    }
});

router.delete('/:group/:service', async (req, res) => {
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
});

module.exports = router;
