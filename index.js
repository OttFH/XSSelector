const loadCommandLineArgs = require('./src/args/handleParameters');
const {setLogLevel, logger} = require('./src/logging/logger');
const main = require('./src/main');

(async function () {
    const params = await loadCommandLineArgs();

    setLogLevel(params.logLevel);

    return main({
        params,
    });
})().then(() => process.exit(0))
    .catch(e => {
        logger.error('unhandled exception:', e);
        process.exit(1);
    })
