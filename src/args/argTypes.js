const Arg = require('./arg');
const logLevels = require('../logging/logLevels');

const loggingOptions = Object.keys(logLevels).map(level => level.toLowerCase()).join(', ');

const argNames = {
    HELP: 'help',
    URLS: 'urls',
    URLS_FILE: 'urls-file',
    CODE_MODE: 'code',
    ALL_PARAMS: 'all-params',
    ALL_PAYLOADS: 'all-payloads',
    COOKIE: 'cookie',
    PARAMS: 'params',
    CRAWL: 'crawl',
    CRAWL_DEPTH: 'crawl-depth',
    LOG_LEVEL: 'log-level',
    GENERATE_SEARCH_KEY: 'gen-key',
    SHOW_BROWSER: 'show-browser',
    DETECTING_RETRIES: 'retries',
    DETECTING_RETRY_DELAY: 'retry-delay',
}

const argTypes = [
    new Arg({
        shortName: 'h',
        longName: argNames.HELP,
        description: 'just shows this help message.',
    }),
    new Arg({
        shortName: 'u',
        longName: argNames.URLS,
        valueType: 'string',
        description: 'list of urls to check.',
    }),
    new Arg({
        longName: argNames.URLS_FILE,
        valueType: 'string',
        description: 'path of a text files with urls to check.',
    }),
    new Arg({
        longName: argNames.CODE_MODE,
        defaultValue: 'string',
        description: 'path of a files with code to execute. Check out README for more information.',
        // TODO: implement code mode
    }),
    new Arg({
        longName: argNames.ALL_PARAMS,
        defaultValue: false,
        description: 'check all parameters of an url even if a vulnerable parameter is found. (Not used yet)',
    }),
    new Arg({
        longName: argNames.ALL_PAYLOADS,
        defaultValue: false,
        description: 'try all generated payloads an url even if a vulnerable payload is found.',
    }),
    new Arg({
        shortName: 'c',
        longName: argNames.COOKIE,
        defaultValue: 'string',
        description: 'a cookie to use. Use multiple times for multiple cookies. Format: --cookie "cookie-name" "cookie-value"',
        isHierarchical: true
    }),
    new Arg({
        longName: argNames.PARAMS,
        defaultValue: false,
        description: 'search for parameters. (not implemented yet)',
        // TODO: implement search for parameters
    }),
    new Arg({
        longName: argNames.CRAWL,
        defaultValue: false,
        description: 'search for more urls to check. (not implemented yet)',
        // TODO: implement search for more urls to check
    }),
    new Arg({
        longName: argNames.CRAWL_DEPTH,
        defaultValue: 8,
        description: 'maximum depth to crawl. (not implemented yet)',
        // TODO: implement maximum depth to crawl
    }),
    new Arg({
        longName: argNames.GENERATE_SEARCH_KEY,
        defaultValue: false,
        description: 'generate a search key and not use the one from config. (not implemented yet)',
        // TODO: implement generate a search key and not use the one from config
    }),
    new Arg({
        longName: argNames.SHOW_BROWSER,
        defaultValue: false,
        description: 'show browser window. (not implemented yet)',
        // TODO: implement (not) showing browser
    }),
    new Arg({
        longName: argNames.DETECTING_RETRIES,
        defaultValue: 3,
        description: 'how often to wait for xss to occur. (not implemented yet)',
        // TODO: implement how often to wait for xss to occur
    }),
    new Arg({
        longName: argNames.DETECTING_RETRY_DELAY,
        defaultValue: 500,
        description: 'how long to wait between tries for xss to occur. (not implemented yet)',
        // TODO: implement how long to wait between tries for xss to occur
    }),
    new Arg({
        longName: argNames.LOG_LEVEL,
        defaultValue: 'warn',
        description: `sets log level. options: ${loggingOptions}.`,
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
