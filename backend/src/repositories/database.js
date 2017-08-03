const configPromise = require('../config');
const monk = require('monk');

module.exports = new Promise((resolve) => {
    configPromise.then((config) => {
        monk(config.uri).then(
            (db) => {
                console.log('Connection to database established');
                //the Monk Manager (db) must me put into a object or the Promise will never resolve.
                //apparently the Monk Manager is a thenable that never resolves itself.
                resolve({db: db});
            }
        ).catch(
            (err) => {
                console.error('Could not connect to database');
                console.error(err);
                process.exit(1);
            }
        );
    });
});
