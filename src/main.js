const {logger} = require('./logging/logger');
const printHelp = require('./utils/printHelp');
const runner = require('./runner');
const startProxy = require('./proxy');

// TODO: add code mode
// TODO: add more payloads
// TODO: add crawl mode
// TODO: update README
// TODO: optimize combination testing (some may have been tested already)
// TODO: fix starting with npm
// TODO: fix proxy loading (not finishing) issue

async function main({params}) {
    if (params.help) {
        printHelp();
        return;
    }

    if (!params.urls.length) {
        logger.warn('no urls to check.');
        return;
    }

    const setProxyMods = startProxy(params.proxyPort);
    await runner({params, setProxyMods});
}

module.exports = main;
