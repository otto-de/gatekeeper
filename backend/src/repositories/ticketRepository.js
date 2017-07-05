const db = require('./database');

module.exports = {

    addTicket: async function (group, service, environment, ticketId) {
        const gatekeeperCollection = db.get('gatekeeper');

        let byGroupAndService = {group: group, name: service};
        let doc = await gatekeeperCollection.findOne(byGroupAndService);
        if (doc) {
            return gatekeeperCollection.update({_id: doc._id},
                {
                    $push: {
                        ['environments.' + environment + '.queue']: ticketId
                    }
                }
            );
        }
        return null;
    }
};
