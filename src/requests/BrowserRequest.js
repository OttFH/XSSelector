const RequestModifications = require('../proxy/RequestModifications');
const {ifTruthy, removeUndefined} = require('../utils');
const {httpMethods} = require('../constents');

function isSendBodyHttpMethod(method) {
    return [httpMethods.POST, httpMethods.PUT, httpMethods.DELETE].includes(method);
}

function randomText(length) {
    let text = '';
    while (text.length < length) {
        text += Math.random().toString().replace('.', '');
    }
    return text.substr(10);
}

class BrowserRequest {
    /**
     * Creates BrowserRequest
     * @param url {string} the url the browser has to call
     * @param cookies {{name: string, value: string}[]} an array of cookies which to set in the browser
     * @param modifications {RequestModifications|null} the modifications the proxy uses to modify the request from the browser.
     */
    constructor({url, cookies, modifications}) {
        this.url = url;
        this.cookies = cookies;
        this.modifications = modifications;
    }

    static build({
                     baseUrl,
                     proxyPort,
                     method,
                     headers,
                     cookies,
                     browserCookies,
                     forceBrowserCookies,
                     path,
                     query,
                     hash,
                     body,
                     contentType,
                 }) {
        const proxyParameter = `proxyId=${randomText(10)}`;
        const requestQuery = `?${query}${ifTruthy(query, `&`, proxyParameter)}`;
        const targetUrl = `/${path}${ifTruthy(query, '?')}${ifTruthy(hash, '#')}`;
        const requestUrl = `/${path}${requestQuery}${ifTruthy(hash, '#')}`;

        const isSendBody = isSendBodyHttpMethod(method);
        const sendRequestViaProxy = method !== httpMethods.GET || Object.keys(headers).length;
        const requestHeaders = removeUndefined({
            ...headers,
            cookie: !forceBrowserCookies && sendRequestViaProxy && cookies || undefined,
        });
        if (isSendBody) {
            requestHeaders['Content-Type'] = contentType || 'application/x-www-form-urlencoded';
            requestHeaders['Content-Length'] = Buffer.byteLength(body);
        }
        return new BrowserRequest(sendRequestViaProxy || requestHeaders.cookie ? {
            url: `http://localhost:${proxyPort}` + requestUrl,
            modifications: new RequestModifications({
                target: baseUrl,
                method: method,
                targetUrl,
                requestUrl,
                body: isSendBody ? body : undefined,
                headers: requestHeaders,
                proxyParameter,
            }),
            cookies: forceBrowserCookies ? browserCookies : null,
        } : {
            url: baseUrl + targetUrl,
            modifications: null,
            cookies: browserCookies,
        });
    }
}

module.exports = BrowserRequest;
