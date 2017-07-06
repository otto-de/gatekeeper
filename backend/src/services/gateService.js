const gateRepository = require('../repositories/gateRepository');

module.exports = {

    findGate: async (group, service, environments) => {
        return await gateRepository.findGate(group, service, environments);
    },

    createOrUpdateService: async (group, service, environments) => {
        return await gateRepository.createOrUpdateService(group, service, environments);
    },

    setGate: async (group, service, environment, state, message) => {
        let timestamp;
        if (state) {
            timestamp = new Date().getTime();
        }
        return await gateRepository.setGate(group, service, environment, state, timestamp, message);
    },

    deleteService: async (group, service) => {
        return await gateRepository.deleteService(group, service);
    }
};
