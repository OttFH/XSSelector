const {logger} = require('./logging/logger');
const printHelp = require('./utils/printHelp');
const runner = require('./runner');
const startProxy = require('./proxy');

// TODO: update README
// TODO: optimize combination testing (some may have been tested already)
// TODO: fix starting with npm
// TODO: fix proxy loading (not finishing) issue

async function main({params}) {
    if (params.help) {
        printHelp();
        return;
    }

    if (!params.urls.length && !params.codeModePaths.length) {
        logger.warn('no urls or code mode files to check.');
        return;
    }

    const proxy = startProxy(params.proxyPort);
    await runner({params, proxy});
}

module.exports = main;
