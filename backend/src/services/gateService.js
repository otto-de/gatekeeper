const gateRepository = require('../repositories/gateRepository');
const OPEN = 'open';
const CLOSED = 'closed';
const LOCKED = 'locked';

module.exports = {

    findGate: async (group, service, environments) => {
        return await gateRepository.findGate(group, service, environments);
    },

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

    setGateState: async (group, service, environment, open) => {
        return await gateRepository.setGateState(group, service, environment, open);
    }
};
