const gateRepository = require('../repositories/gateRepository');

module.exports = {

    createOrUpdateService: (service, group, environments) => {
        gateRepository.createOrUpdateService(service, group, environments);
        return null;
    },

    isOpen: (group, service, environment) => {
        const gate = gateRepository.findGate(group, service, environment);
        return Boolean(gate) && 'open' === gate.state;
    }

};
