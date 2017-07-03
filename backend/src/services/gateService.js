const gateRepository = require('../repositories/gateRepository');

module.exports = {

    createOrUpdateService: async (group, service, environments) => {
        return await gateRepository.createOrUpdateService(group, service, environments);
    },

    isOpen: async (group, service, environment) => {
        const gate = await gateRepository.findGate(group, service, environment);
        return Boolean(gate) && 'open' === gate.state;
    },

    setGate: async (group, service, environment, open) => {
        return await gateRepository.setGate(group, service, environment, open);
    },

    enterGate: async (group, service, environment, queue, ticketId) => {
        const gate = await gateRepository.findGate(group, service, environment);
    }

};
