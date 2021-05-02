const RequestModifications = require('../proxy/RequestModifications');
const {ifTruthy, removeUndefined} = require('../utils');
const {httpMethods, parameterTypes} = require('../constents');

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

class RequestTemplate {
    constructor({
                    baseUrl,
                    proxyBaseUrl,
                    method,
                    headers,
                    cookies,
                    browserCookies,
                    forceBrowserCookies,
                    parameters
                }) {
        this.baseUrl = baseUrl;
        this.proxyBaseUrl = proxyBaseUrl;
        this.method = method;
        this.headers = headers;
        this.cookies = cookies;
        this.browserCookies = browserCookies;
        this.forceBrowserCookies = forceBrowserCookies;
        this.parameters = parameters;
    }

    generateRequest({type, index, value}) {
        const {
            [parameterTypes.PATH]: path,
            [parameterTypes.QUERY]: query,
            [parameterTypes.HASH]: hash,
            [parameterTypes.BODY]: body,
        } = Object.entries(this.parameters).reduce((all, [parameterType, parameter]) => {
            all[parameterType] = parameterType === type ?
                parameter.generateModified(index, value) : parameter.generate();
            return all;
        }, {});

        const requestQuery = `?${query}${ifTruthy(query, `&`, `proxyId=${randomText(10)}`)}`;
        const targetUrl = `/${path}${ifTruthy(query, '?')}${ifTruthy(hash, '#')}`;
        const requestUrl = `/${path}${requestQuery}${ifTruthy(hash, '#')}`;

        const isSendBody = isSendBodyHttpMethod(this.method);
        const sendRequestViaProxy = this.method !== httpMethods.GET || Object.keys(this.headers).length;
        const headers = removeUndefined({
            ...this.headers,
            cookie: !this.forceBrowserCookies && sendRequestViaProxy && this.cookies || undefined,
        });
        if (isSendBody) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            headers['Content-Length'] = Buffer.byteLength(body);
        }
        return sendRequestViaProxy || headers.cookie ? {
            url: this.proxyBaseUrl + requestUrl,
            mods: new RequestModifications({
                target: this.baseUrl,
                method: this.method,
                targetUrl,
                requestUrl,
                body: isSendBody ? body : undefined,
                headers,
            }),
            browserCookies: this.forceBrowserCookies ? this.browserCookies : null,
        } : {
            url: this.baseUrl + targetUrl,
            mods: null,
            browserCookies: this.browserCookies,
        };
    }
}

module.exports = RequestTemplate;
