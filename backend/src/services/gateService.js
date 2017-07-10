const gateRepository = require('../repositories/gateRepository');

function getOrInit(obj, elem) {
    if (!obj[elem]) {
        obj[elem] = {};
    }
    return obj[elem];
}
module.exports = {
    getAllGates: async () => {
        const docs = await gateRepository.getAll();
        const state = {gates: {}};
        docs.forEach(doc => {
            let service = getOrInit(getOrInit(state.gates, doc['group']), doc['name']);
            Object.keys(doc['environments']).forEach(env => service[env] = doc['environments'][env]);
        });
        return state;
    },

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
