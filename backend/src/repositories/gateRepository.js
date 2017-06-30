const monk = require('monk');

module.exports = {

    updateEnvironments: function (currentEnvironments, newEnvironments) {
        let withoutDeletedEnvironments = Object.keys(currentEnvironments)
            .filter((env) => newEnvironments.includes(env))
            .reduce((acc, env) => {
                return Object.assign(
                    acc,
                    {[env]: currentEnvironments[env]})
            }, {});

        let withNewEnvironments = newEnvironments
            .filter((env) => !Object.keys(currentEnvironments).includes(env))
            .reduce((acc, env) => {
                    return Object.assign(
                        acc, {
                        [env]: {
                            'queue': [],
                            'message_timestamp': '',
                            'state': 'closed',
                            'message': '',
                            'state_timestamp': ''
                        }
                    })
                }
                , withoutDeletedEnvironments);

        return withNewEnvironments;
    },

    createOrUpdateService: function (service, group, environments) {
        let db = monk('localhost/gatekeeper');

        const gatekeeperCollection = db.get('gatekeeper');

        let byGroupAndService = {group: group, name: service};

        gatekeeperCollection.findOne(byGroupAndService)
            .then((doc) => {
                gatekeeperCollection.update({_id: doc._id},
                    {$set: {environments: this.updateEnvironments(doc.environments, environments)}}
                );
            })
            .then((result) => {
                console.log(`updated environments: ${result}`)
            });

        /*
         let data = {
         "_id": "9d9ea14f-b619-4bf2-a0cc-b87f29062132",
         "document_version": 2.2,
         "group": "p13n",
         "name": "p13n",
         "environments": {
         "live": {
         "queue": [],
         "message_timestamp": "",
         "state": "open",
         "message": "",
         "state_timestamp": "2016-04-06 22:17:54+0200"
         },
         "develop": {
         "queue": [],
         "message_timestamp": "",
         "state": "open",
         "message": "",
         "state_timestamp": "2016-04-06 22:17:54+0200"
         }
         }
         }
         */
    }
};