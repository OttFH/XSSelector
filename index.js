const loadCommandLineArgs = require('./src/args/handleParameters');
const {setParams, logger} = require('./src/logging/logger');
const main = require('./src/main');

(async function () {
    const params = await loadCommandLineArgs();

    setParams(params);

    return main({
        params,
    });
})().then(() => process.exit(0))
    .catch(e => {
        logger.error('unhandled exception:', e);
        process.exit(1);
    })
