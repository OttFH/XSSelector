const Arg = require('./arg');
const {logLevels, httpMethods, argNames} = require('../constents');

const methodOptions = Object.keys(httpMethods).map(method => method.toLowerCase()).join(', ');
const loggingOptions = Object.keys(logLevels).map(level => level.toLowerCase()).join(', ');

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
        shortName: 'X',
        longName: argNames.METHOD,
        defaultValue: httpMethods.GET,
        description: `change the HTTP method for the requests. options: ${methodOptions}.`,
    }),
    new Arg({
        longName: argNames.BODY,
        valueType: 'string',
        description: 'the body that is used as request body. FORMAT',
    }),
    new Arg({
        shortName: 'h',
        longName: argNames.HEADER,
        defaultValue: 'string',
        description: 'a header to send. Use multiple times for multiple headers. Format: --header "name" "value"',
        isHierarchical: true,
    }),
    new Arg({
        shortName: 'c',
        longName: argNames.COOKIE,
        defaultValue: 'string',
        description: 'a cookie to use. Use multiple times for multiple cookies. Format: --cookie "name=value"',
    }),
    new Arg({
        longName: argNames.USE_BROWSER_COOKIE,
        defaultValue: false,
        description: 'always sets cookies within the browser. Otherwise may set cookie only via internal proxy.',
    }),
    new Arg({
        longName: argNames.PARAMS,
        defaultValue: false,
        description: 'search for query- and body parameters in DOM.',
    }),
    new Arg({
        longName: argNames.CRAWL,
        defaultValue: false,
        description: 'search for more URLs to check.',
    }),
    new Arg({
        longName: argNames.CRAWL_DEPTH,
        defaultValue: 8,
        description: 'maximum depth to crawl.',
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
        longName: argNames.DETECTING_TIMEOUT,
        defaultValue: 200,
        description: 'how long to wait in milliseconds for xss to occur.',
    }),
    new Arg({
        longName: argNames.INTERNAL_PROXY_PORT,
        defaultValue: 7132,
        description: 'changes the port of the internal proxy. This proxy is used to modify requests.',
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
