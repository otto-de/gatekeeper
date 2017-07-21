const gateRepository = require('../repositories/gateRepository');

function getOrInit(obj, elem) {
    if (!obj[elem]) {
        obj[elem] = {};
    }
    return obj[elem];
}

function calcAutoState(gate) {
    if(gate) {
        return Object.assign({}, gate, { auto_state: (gate.queue || []).length === 0 ? 'open' : 'closed'});
    }
    return null;
}

module.exports = {
    getAllGates: async () => {
        const docs = await gateRepository.getAll();
        const state = {gates: {}};
        docs.forEach(doc => {
            let service = getOrInit(getOrInit(state.gates, doc['group']), doc['name']);
            let environments = doc['environments'];
            Object.keys(environments).forEach(envKey => service[envKey] = calcAutoState(environments[envKey]));
        });
        return state;
    },

    findGate: async (group, service, environment) => {
        return calcAutoState(await gateRepository.findGate(group, service, environment));
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
