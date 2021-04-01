const Arg = require('./arg');
const logLevels = require('../logging/logLevels');

const loggingOptions = Object.keys(logLevels).map(level => level.toLowerCase()).join();

const argNames = {
    HELP: 'help',
    URLS: 'urls',
    URLS_FILE: 'urls-file',
    ALL_PARAMS: 'all-params',
    ALL_PAYLOADS: 'all-payloads',
    COOKIES: 'cookies',
    PARAMS: 'params',
    CRAWL: 'crawl',
    CRAWL_DEPTH: 'crawl-depth',
    LOG_LEVEL: 'log-level',

    GENERATE_SEARCH_KEY: 'gen-key',
    CODE_MODE: 'code',
    SHOW_BROWSER: 'show-browser',
}

const argTypes = [
    new Arg({
        shortName: 'h',
        longName: argNames.HELP,
        description: 'just shows this help message.'
    }),
    new Arg({
        shortName: 'u',
        longName: argNames.URLS,
        valueType: 'string',
        description: 'list of urls to check.'
    }),
    new Arg({
        longName: argNames.URLS_FILE,
        valueType: 'string',
        description: 'path of a text file with urls to check.'
    }),
    new Arg({
        longName: argNames.ALL_PARAMS,
        defaultValue: false,
        description: 'check all parameters of an url even if a vulnerable parameter is found.'
    }),
    new Arg({
        longName: argNames.ALL_PAYLOADS,
        defaultValue: false,
        description: 'try all generated payloads an url even if a vulnerable payload is found.'
    }),
    new Arg({
        shortName: 'c',
        longName: argNames.COOKIES,
        defaultValue: 'string',
        description: 'cookies to use.'
    }),
    new Arg({
        longName: argNames.PARAMS,
        defaultValue: true,
        description: 'search for parameters.'
    }),
    new Arg({
        longName: argNames.CRAWL,
        defaultValue: false,
        description: 'search for more urls to check.'
    }),
    new Arg({
        longName: argNames.CRAWL_DEPTH,
        defaultValue: 8,
        description: 'maximum depth to crawl.'
    }),
    new Arg({
        longName: argNames.LOG_LEVEL,
        defaultValue: 'warn',
        description: `sets log level. options: ${loggingOptions}.`
    }),
];

function getArgType(name) {
    return argTypes.find(type => type.longName === name);
}

module.exports = {
    argNames,
    argTypes,
    getArgType,
}