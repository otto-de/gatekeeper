const fs = require('fs');

const config = {};
const args = parseCommandlineArguments();
const environment = args.group || process.env.GROUP || 'local';
console.log('Starting on ' + environment);

function parseCommandlineArguments() {
    const args_map = {};
    process.argv.slice(2).forEach(
        (arg) => {
            if (arg.includes('=')) {
                const split = arg.split('=');
                args_map[split[0].toLowerCase()] = split[1]
            }
        });
    return args_map;
}

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

try {
    const configFile = readConfig(environment);
    config.collection = configFile['collection'];
    config.uri = buildMongoUri(configFile);
} catch (err) {
    console.error('Could not load/parse config file:\n ' + err);
    process.exit(1);
}

module.exports = config;
