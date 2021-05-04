const RequestTemplateBuilder = require('../requests/RequestTemplateBuilder');
const CodeModeTemplateBuilder = require('../codeMode/CodeModeTemplateBuilder');

function getTemplateBuilder(params) {
    return [
        ...params.urls.map(url => new RequestTemplateBuilder({
            rawUrl: url,
            proxyPort: params.proxyPort,
            method: params.method,
            body: params.body,
            headers: params.headers,
            cookies: params.cookies,
            forceBrowserCookies: params.forceBrowserCookies,
            crawlDepth: 0,
        })),
        ...params.codeModePaths.map(path => new CodeModeTemplateBuilder({path})),
    ];
}

module.exports=getTemplateBuilder;
