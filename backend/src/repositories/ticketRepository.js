const db = require('./database');
const config = require('../config');

module.exports = {

    addTicket: async function (group, service, environment, ticketId) {
        const gatekeeperCollection = db.get(config.collection);

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
    },

    deleteTicket: async (group, service, environment, ticketId) => {
        const gatekeeperCollection = db.get(config.collection);

        let byGroupAndService = {group: group, name: service};
        let doc = await gatekeeperCollection.findOne(byGroupAndService);
        if (doc) {
            return gatekeeperCollection.update({_id: doc._id},
                {
                    $pull: {
                        ['environments.' + environment + '.queue']: ticketId
                    }
                }
            );
        }
        return null;
    }
};
