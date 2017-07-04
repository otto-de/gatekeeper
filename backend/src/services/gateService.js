const gateRepository = require('../repositories/gateRepository');
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

    createOrUpdateService: async (group, service, environments) => {
        return await gateRepository.createOrUpdateService(group, service, environments);
    },

    isOpen: async (group, service, environment) => {
        const gate = await gateRepository.findGate(group, service, environment);
        return Boolean(gate) && OPEN === gate.state;
    },

    setGate: async (group, service, environment, open) => {
        return await gateRepository.setGate(group, service, environment, open);
    }
};
