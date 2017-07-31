const fs = require('fs');

const config = {};
const environment = process.env.ENVIRONMENT || 'local';

function readConfig(environment) {
    const contents = fs.readFileSync('../resources/' + environment + '.json', 'utf-8');
    return JSON.parse(contents);
}

function buildMongoUri(config) {
    let auth = '';
    if (config['username']) {
        auth = config['username'] + ':' + config['password'] + '@'
    }
    const uris = config['hosts'].map((host) => {
        return auth + host + ':' + config['port'] + '/' + config['database']
    });
    return uris.join()
}

const configFile = readConfig(environment);
config.collection = configFile['collection'];
config.uri = buildMongoUri(configFile);

module.exports = config;
