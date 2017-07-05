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
        } else {
            return null;
        }
    },

    setGateState: async function (group, service, environment, open) {
        const gatekeeperCollection = db.get('gatekeeper');

        let byGroupAndService = {group: group, name: service};
        let doc = await gatekeeperCollection.findOne(byGroupAndService);

        let state = open ? 'open' : 'closed';
        await gatekeeperCollection.update({_id: doc._id},
            {$set: {['environments.' + environment + '.state']: state}});

        return {state};
    }
};