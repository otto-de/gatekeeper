const fs = require('fs');
const Vault = require('node-vault');

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
    return 'mongodb://' + auth + config['hosts'].join(',') + '/' + config['database'] + (config['replicaSet'] ? '?replicaSet=' + config['replicaSet'] : '')
}

async function readSecrets(secret, vault, config) {
    let {path, key, alias} = secret;
    try {
        let result = await vault.read(path);
        if (result && result.data && result.data[key]) {
            config[alias] = result.data[key];
        } else {
            console.error('Vault response is empty or missing the secret key: ' + key);
            process.exit(1);
        }
    } catch (err) {
        console.error('Error while reading vault secrets: ' + err);
        process.exit(1);
    }
}

module.exports = new Promise(async (resolve) => {
    let config;
    try {
        config = readConfig(environment);
        if ('vaultSecrets' in config) {
            const vault = Vault({
                endpoint: process.env.VAULT_ADDR,
                token: process.env.VAULT_TOKEN,
                requestOptions: {
                    port: 443,
                    ca: (config.ca ? fs.readFileSync(config.ca) : ''),
                    rejectUnauthorized: true
                }
            });
            for (let secret of config['vaultSecrets']) {
                await readSecrets(secret, vault, config);
            }
        }
        config.uri = buildMongoUri(config);
    } catch (err) {
        console.error('Could not load/parse config file:\n ' + err);
        process.exit(1);
    }
    resolve(config)
});
