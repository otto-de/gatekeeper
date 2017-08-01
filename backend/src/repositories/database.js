const config = require('../config');
const monk = require('monk')(config.uri);
monk.then(
    () => {
        console.log('Connection to database established')
    }
).catch(
    (err) => {
        console.error("Could not connect to database");
        console.error(err);
        process.exit(1);
    }
);

module.exports = monk;
