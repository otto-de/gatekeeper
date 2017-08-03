const configPromise = require('../config');
const dbPromise = require('./database');

let db;
let config;

configPromise.then((configResolve) => {
    config = configResolve;
});

dbPromise.then((dbResolve) => {
    db = dbResolve.db;
});

module.exports = {

    addTicket: async function (group, service, environment, ticketId) {
        const gatekeeperCollection = db.get(config.collection);

        let byGroupAndService = {group: group, name: service};
        let doc = await gatekeeperCollection.findOne(byGroupAndService);
        if (doc) {
            return await gatekeeperCollection.update({_id: doc._id},
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
            return await gatekeeperCollection.update({_id: doc._id},
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
