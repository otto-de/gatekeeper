const gateService = require('../services/gateService');
const ticketRepository = require('../repositories/ticketRepository');
const uuidv4 = require('uuid/v4');
const OPEN = 'open';
const CLOSED = 'closed';
const LOCKED = 'locked';

module.exports = {

    checkGate: (gate, ticketId = false) => {
        if (gate.state === CLOSED) {
            return CLOSED;
        }
        if (gate.queue.length >= 1) {
            if (ticketId && !gate.queue.includes(ticketId)) {
                return CLOSED;
            }
            if (ticketId && gate.queue[0] === ticketId) {
                return OPEN;
            }
            return LOCKED;
        }
        return OPEN;
    },

    enterGate: async function (group, service, environment, queue, ticketId) {
        const gate = await gateService.findGate(group, service, environment);
        const state = this.checkGate(gate, ticketId);
        if (state === CLOSED) {
            return {state: state};
        }
        if (state === LOCKED && !queue) {
            return {state: CLOSED};
        }
        // OPEN or LOCKED & QUEUE
        return this.addTicket(group, service, environment, state, ticketId);
    },

    addTicket: async (group, service, environment, state, ticketId) => {
        if (ticketId) {
            return {state: state, ticketId: ticketId};
        }
        const ticket = uuidv4();
        await ticketRepository.addTicket(group, service, environment, ticket);
        return {state: state, ticketId: ticket};
    },

    OPEN,
    CLOSED,
    LOCKED
};
