const gateRepository = require('../repositories/gateRepository');

module.exports = {

    createOrUpdateService: (service, group, environments) => {
        console.log('REAL Gate Service was called');
        gateRepository.createOrUpdateService(service, group, environments);
        return null;
    },

    findGate: (service, group, environment) => {
    }

};
