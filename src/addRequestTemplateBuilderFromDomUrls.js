const RequestTemplateBuilder = require('./requests/RequestTemplateBuilder');
const {httpMethods} = require('./constents');

function addRequestTemplateBuilderFromDomUrls(params, builders, baseTargetUrl, domUrls, crawlDepth, proxyParameter) {
    domUrls.map(domUrl => {
        const url = new URL(baseTargetUrl + domUrl.url.replace(`?${proxyParameter}`, '').replace(`&${proxyParameter}`, ''));
        let body = null;
        if (domUrl.method === httpMethods.POST) {
            body = domUrl.parameters.map(({key, value}) => `${key}=${value}`).join('&')
        } else {
            domUrl.parameters.forEach(({key, value}) => url.searchParams.append(key, value.toString()));
        }
        let search = url.searchParams.toString();
        if (search && !search.startsWith('?')) {
            search = `?${search}`;
        }
        const hash = url.hash && !url.hash.startsWith('#') ? `#${url.hash}` : url.hash;
        const rawUrl = url.origin + url.pathname + search + hash;
        return new RequestTemplateBuilder({
            rawUrl,
            proxyBaseUrl: `http://localhost:${params.proxyPort}`,
            method: domUrl.method,
            body,
            headers: params.headers,
            cookies: params.cookies,
            forceBrowserCookies: params.forceBrowserCookies,
            crawlDepth,
        })
    }).forEach(newTemplate => {
        if (builders.every(b => !b.equals(newTemplate))) builders.push(newTemplate);
    });

}

module.exports = addRequestTemplateBuilderFromDomUrls;
