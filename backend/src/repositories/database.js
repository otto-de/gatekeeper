const config = require('../config');
module.exports = require('monk')(config.uri);
