const RequestTemplate = require('./RequestTemplate');

function generateRequestCombinations({params, rawUrl}) {
    const template = new RequestTemplate({
        rawUrl,
        proxyBaseUrl: `http://localhost:${params.proxyPort}`,
        method: params.method,
        body: params.body,
        headers: params.headers,
        cookies: params.cookies,
        forceBrowserCookies: params.forceBrowserCookies
    });

    return template.generateCombinations();
}

module.exports = generateRequestCombinations;
