const {logger} = require('../logging/logger');
const logLevels = require('../logging/logLevels');
const {argNames, argTypes, getArgType} = require('./argTypes');
const generateDefaultParams = require("./generateDefaultParams");
const fs = require('fs');

function getGroupedArgs() {
    const args = {};
    let currentArg = null;
    process.argv.forEach(arg => {
        const argType = argTypes.find(type => type.isArg(arg));
        if (argType) {
            currentArg = argType.longName;
            args[currentArg] = [];
        } else if (args[currentArg]) {
            args[currentArg].push(arg);
        }
    });
    return args;
}

function handleArgName(groupedArgs, name, handler) {
    if (groupedArgs[name]) return handler(groupedArgs[name]);
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
    handleArgName(grouped, argNames.COOKIES, args => params.cookies.push(...args));
    handleArgName(grouped, argNames.PARAMS, () => params.searchParams = true); // TODO: handle false values
    handleArgName(grouped, argNames.CRAWL, () => params.crawlDepth = getArgType(argNames.CRAWL_DEPTH).defaultValue);
    handleArgName(grouped, argNames.CRAWL_DEPTH, args => {
        if (args.length >= 1) {
            params.crawlDepth = parseInt(args[0], 10);
        }
        if (args.length !== 1) {
            logger.warn(`${argNames.CRAWL_DEPTH} needs a single value, you provided: ${args.length}`);
        }
    });
    handleArgName(grouped, argNames.LOG_LEVEL, args => {
        if (args.length >= 1) {
            const levelName = Object.keys(logLevels).find(key => key.toLowerCase() === args[0].toLowerCase());
            if (levelName) {
                params.logLevel = logLevels[levelName];
            } else {
                logger.warn(`unknown log level: ${args[0]}`);
            }
        }
        if (args.length !== 1) {
            logger.warn(`${argNames.LOG_LEVEL} needs a single value, you provided: ${args.length}`);
        }
    });

    return params;
}

module.exports = loadCommandLineArgs;
