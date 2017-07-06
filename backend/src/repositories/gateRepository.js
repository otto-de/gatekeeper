const db = require('./database');

module.exports = {
    updateEnvironments: function (currentEnvironments, newEnvironments) {
        let withoutDeletedEnvironments = Object.keys(currentEnvironments)
            .filter((env) => newEnvironments.includes(env))
            .reduce((acc, env) => {
                return Object.assign(
                    acc,
                    {[env]: currentEnvironments[env]});
            }, {});

        return newEnvironments
            .filter((env) => !Object.keys(currentEnvironments).includes(env))
            .reduce((acc, env) => {
                return Object.assign(
                    acc, {
                        [env]: {
                            'queue': [],
                            'message_timestamp': '',
                            'state': 'open',
                            'message': '',
                            'state_timestamp': ''
                        }
                    });
            }, withoutDeletedEnvironments);
    },

    createOrUpdateService: async function (group, service, environments) {
        const gatekeeperCollection = db.get('gatekeeper');

        let byGroupAndService = {group: group, name: service};
        let doc = await gatekeeperCollection.findOne(byGroupAndService);

        if (doc) {
            return gatekeeperCollection.update({_id: doc._id},
                {$set: {environments: this.updateEnvironments(doc.environments, environments)}}
            );
        } else {
            return gatekeeperCollection.insert({
                'group': group,
                'name': service,
                'environments': this.updateEnvironments({}, environments)
            });
        }
    },

    findGate: async function (group, service, environment) {
        const gatekeeperCollection = db.get('gatekeeper');
        let byGroupAndService = {group: group, name: service};
        let gates = await gatekeeperCollection.findOne(byGroupAndService);
        if (gates) {
            return gates.environments[environment] || null;
        }
        return null;

    },

    setGate: async function (group, service, environment, state, timestamp, message) {
        const gatekeeperCollection = db.get('gatekeeper');

        let gateUpdate = {};
        if (state) {
            gateUpdate.state = state;
        }
        if (timestamp) {
            gateUpdate.timestamp = timestamp;
        }
        if (message) {
            gateUpdate.message = message;
        }

        let byGroupAndService = {group: group, name: service};
        let doc = await gatekeeperCollection.findOne(byGroupAndService);
        if (doc) {
            const result = await gatekeeperCollection.update({_id: doc._id},
                {$set: {['environments.' + environment]: gateUpdate}});
            return result.n >= 1;
        }
        return null;
    },

    deleteService: async function (group, service) {
        const gatekeeperCollection = db.get('gatekeeper');
        let byGroupAndService = {group: group, name: service};

        const result = await gatekeeperCollection.remove(byGroupAndService);
        return result.result.n >= 1;
    }
};