const {logLevels, argNames} = require('../constents');
const {getArgType} = require('./argTypes');

function generateDefaultParams() {
    return {
        help: false,
        urls: [],
        codeModePaths: [],
        allParams: getArgType(argNames.ALL_PARAMS).defaultValue,
        allPayloads: getArgType(argNames.ALL_PAYLOADS).defaultValue,
        method: getArgType(argNames.METHOD).defaultValue,
        body: null,
        headers: {},
        cookies: [],
        forceBrowserCookies: getArgType(argNames.USE_BROWSER_COOKIE).defaultValue,
        searchParams: getArgType(argNames.PARAMS).defaultValue,
        crawlDepth: getArgType(argNames.CRAWL).defaultValue ? getArgType(argNames.CRAWL_DEPTH).defaultValue : 0,
        detectionTimeout: getArgType(argNames.DETECTING_TIMEOUT).defaultValue,
        headless: !getArgType(argNames.SHOW_BROWSER).defaultValue,
        proxyPort: getArgType(argNames.INTERNAL_PROXY_PORT).defaultValue,
        logLevel: logLevels.WARN,
    };
}

module.exports = generateDefaultParams;
