const logLevels = require('../logging/logLevels');
const {argNames} = require('./argTypes');
const {getArgType} = require('./argTypes');

function generateDefaultParams() {
    return {
        help: false,
        urls: [],
        allParams: getArgType(argNames.ALL_PARAMS).defaultValue,
        allPayloads: getArgType(argNames.ALL_PAYLOADS).defaultValue,
        cookies: null,
        searchParams: getArgType(argNames.PARAMS).defaultValue,
        crawlDepth: getArgType(argNames.CRAWL).defaultValue ? getArgType(argNames.CRAWL_DEPTH).defaultValue : 0,
        logLevel: logLevels.WARN,
    };
}

module.exports = generateDefaultParams;