const logLevels = {
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    VULN: 5,
};

const argNames = {
    HELP: 'help',
    URLS: 'urls',
    URLS_FILE: 'urls-file',
    CODE_MODE: 'code',
    ALL_PARAMS: 'all-params',
    ALL_PAYLOADS: 'all-payloads',
    METHOD: 'method',
    COOKIE: 'cookie',
    USE_BROWSER_COOKIE: 'use-browser-cookie',
    HEADER: 'header',
    PARAMS: 'params',
    BODY: 'body',
    CRAWL: 'crawl',
    CRAWL_DEPTH: 'crawl-depth',
    LOG_LEVEL: 'log-level',
    GENERATE_SEARCH_KEY: 'gen-key',
    SHOW_BROWSER: 'show-browser',
    DETECTING_TIMEOUT: 'detection-timeout',
    INTERNAL_PROXY_PORT: 'internal-proxy-port',
};

const reflectionTypes = {
    HTML_TAG: 'html_tag',
    HTML_NORMAL_ATTRIBUTE: 'html_normal_attribute',
    HTML_HREF_ATTRIBUTE: 'html_href_attribute',
    HTML_EXECUTABLE_ATTRIBUTE: 'html_executable_attribute',
    HTML_COMMENT: 'html_comment',
    SCRIPT: 'script',
};

const httpMethods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
};

const parameterTypes = {
    QUERY: 'query',
    BODY: 'body',
    PATH: 'path',
    HASH: 'hash',
};

const codeModeStepTypes = {
    BROWSER_REQUEST: 'browser_request',
    BROWSER_SCRIPT: 'browser_script',
    AXIOS_REQUEST: 'axion_request',
    RESULT: 'result',
};

module.exports = {
    logLevels,
    argNames,
    reflectionTypes,
    httpMethods,
    parameterTypes,
    codeModeStepTypes,
};
