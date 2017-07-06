const gateRepository = require('../repositories/gateRepository');

module.exports = {

    findGate: async (group, service, environments) => {
        return await gateRepository.findGate(group, service, environments);
    },

    createOrUpdateService: async (group, service, environments) => {
        return await gateRepository.createOrUpdateService(group, service, environments);
    },

    setGateState: async (group, service, environment, open) => {
        return await gateRepository.setGateState(group, service, environment, open);
    },

    deleteService: async (group, service) => {
        return await gateRepository.deleteService(group, service);
    }
};
