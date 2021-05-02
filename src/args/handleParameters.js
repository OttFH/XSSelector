const {logger} = require('../logging/logger');
const {logLevels, httpMethods} = require('../constents');
const {argNames, argTypes, getArgType} = require('./argTypes');
const generateDefaultParams = require('./generateDefaultParams');
const fs = require('fs');

function getGroupedArgs() {
    const args = {};
    let currentArgs = null;
    process.argv.forEach(arg => {
        const argType = argTypes.find(type => type.isArg(arg));
        if (argType) {
            if (!args[argType.longName]) {
                args[argType.longName] = [];
            }
            if (argType.isHierarchical) {
                currentArgs = [];
                args[argType.longName].push(currentArgs);
            } else {
                currentArgs = args[argType.longName];
            }
        } else if (currentArgs) {
            currentArgs.push(arg);
        }
    });
    return args;
}

function handleArgName(groupedArgs, name, handler) {
    if (groupedArgs[name]) return handler(groupedArgs[name]);
}

function getOption(options, value) {
    return value && options.find(option => option.toLowerCase() === value);
}

async function loadCommandLineArgs() {
    const params = generateDefaultParams();
    const grouped = getGroupedArgs();
    handleArgName(grouped, argNames.HELP, () => params.help = true); // TODO: handle false values
    handleArgName(grouped, argNames.URLS, args => params.urls.push(...args));
    await handleArgName(grouped, argNames.URLS_FILE, args => Promise.all(args.map(path => {
        return new Promise(((resolve, reject) => fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            params.urls.push(...data.split(/\r?\n/).filter(Boolean));
            return resolve();
        })));
    })));
    handleArgName(grouped, argNames.ALL_PARAMS, () => params.allParams = true); // TODO: handle false values
    handleArgName(grouped, argNames.ALL_PAYLOADS, () => params.allPayloads = true); // TODO: handle false values
    handleArgName(grouped, argNames.METHOD, args => {
        if (args.length !== 1) {
            logger.warn(`${argNames.METHOD} needs a single value, you provided: ${args.length}`);
        }
        const method = getOption(Object.keys(httpMethods), args[0]);
        if (method) {
            params.method = method;
        } else if (args.length > 0) {
            logger.warn(`"${args[0]}" is not a valid value for ${argNames.METHOD}.`);
        }
    });
    handleArgName(grouped, argNames.BODY, args => {
        if (args.length !== 1) {
            logger.warn(`${argNames.BODY} needs a single value, you provided: ${args.length}`);
        }
        if (args.length >= 1) {
            params.body = args[0];
        }
    });
    handleArgName(grouped, argNames.HEADER, args => args.forEach(header => {
        if (header.length !== 2) {
            logger.warn(`${argNames.HEADER} needs two values, you provided: ${header.length}`);
        }
        if (header.length >= 2) {
            params.headers[header[0]] = header[1];
        }
    }));
    handleArgName(grouped, argNames.COOKIE, args => params.cookies.push(...args));
    handleArgName(grouped, argNames.USE_BROWSER_COOKIE, () => params.forceBrowserCookies = true); // TODO: handle false values
    handleArgName(grouped, argNames.PARAMS, () => params.searchParams = true); // TODO: handle false values
    handleArgName(grouped, argNames.CRAWL, () => params.crawlDepth = getArgType(argNames.CRAWL_DEPTH).defaultValue);
    handleArgName(grouped, argNames.CRAWL_DEPTH, args => {
        if (args.length !== 1) {
            logger.warn(`${argNames.CRAWL_DEPTH} needs a single value, you provided: ${args.length}`);
        }
        const crawlDepth = parseInt(args[0], 10);
        if (crawlDepth) {
            params.crawlDepth = crawlDepth;
        } else if (args.length > 0) {
            logger.warn(`"${args[0]}" is not a valid value for ${argNames.CRAWL_DEPTH}, needs to be a integer.`);
        }
    });
    handleArgName(grouped, argNames.INTERNAL_PROXY_PORT, args => {
        if (args.length !== 1) {
            logger.warn(`${argNames.INTERNAL_PROXY_PORT} needs a single value, you provided: ${args.length}`);
        }
        const proxyPort = parseInt(args[0], 10);
        if (proxyPort) {
            params.proxyPort = proxyPort;
        } else if (args.length > 0) {
            logger.warn(`"${args[0]}" is not a valid value for ${argNames.INTERNAL_PROXY_PORT}, needs to be a integer.`);
        }
    });
    handleArgName(grouped, argNames.LOG_LEVEL, args => {
        if (args.length !== 1) {
            logger.warn(`${argNames.LOG_LEVEL} needs a single value, you provided: ${args.length}`);
        }
        const logLevelName = getOption(Object.keys(logLevels), args[0]);
        if (logLevelName) {
            params.logLevel = logLevels[logLevelName];
        } else if (args.length > 0) {
            logger.warn(`"${args[0]}" is not a valid value for ${argNames.LOG_LEVEL}.`);
        }
    });

    return params;
}

module.exports = loadCommandLineArgs;
