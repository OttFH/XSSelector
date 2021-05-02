const {logLevels} = require('../constents');

let logLevel = logLevels.WARN;

function setLogLevel(parameter) {
    logLevel = parameter;
}

function hasLoglevel(level) {
    return (logLevel || 0) <= level;
}

class Logger {
    log({type, text}) {
        switch (type) {
            case logLevels.DEBUG:
                this.debug(text);
                break;
            case logLevels.INFO:
                this.info(text);
                break;
            case logLevels.WARN:
                this.warn(text);
                break;
            case logLevels.ERROR:
                this.error(text);
                break;
            case logLevels.VULN:
                this.vuln(text);
                break;
        }
    }

    debug(...values) {
        if (hasLoglevel(logLevels.DEBUG)) {
            console.log('[debug]', ...values);
        }
    }

    info(...values) {
        if (hasLoglevel(logLevels.INFO)) {
            console.log('[info]', ...values);
        }
    }

    warn(...values) {
        if (hasLoglevel(logLevels.WARN)) {
            console.log('[warn]', ...values);
        }
    }

    error(...values) {
        if (hasLoglevel(logLevels.ERROR)) {
            console.log('[error]', ...values);
        }
    }

    vuln(...values) {
        if (hasLoglevel(logLevels.VULN)) {
            console.log('[vuln]', ...values);
        }
    }
}

const instance = new Logger();

module.exports = {
    setLogLevel,
    logger: instance,
};
