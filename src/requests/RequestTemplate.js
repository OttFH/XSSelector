const PathParameterHandler = require('./PathParameterHandler');
const SearchParameterHandler = require('./SearchParameterHandler');
const RequestModifications = require('../proxy/RequestModifications');
const RequestCombination = require('./RequestCombination');
const {ifTruthy, removeUndefined} = require('../utils');
const {httpMethods, parameterTypes} = require('../constents');

function isSendBodyHttpMethod(method) {
    return [httpMethods.POST, httpMethods.PUT, httpMethods.DELETE].includes(method);
}

function trimStart(text, toRemove) {
    if (text.startsWith(toRemove)) {
        text = text.substr(toRemove.length);
    }
    return text;
}

function randomText(length) {
    let text = '';
    while (text.length < length) {
        text += Math.random().toString().replace('.', '');
    }
    return text.substr(10);
}

class RequestTemplate {
    constructor({rawUrl, proxyBaseUrl, method, body, headers, cookies, forceBrowserCookies}) {
        const {origin, pathname, searchParams, hash} = new URL(rawUrl);
        this.baseUrl = origin;
        this.proxyBaseUrl = proxyBaseUrl;
        this.method = method;
        this.headers = headers || {};
        this.cookies = (cookies || []).join(';');
        this.browserCookies = (cookies || []).map(cookie => cookie.split('=')).map(([name, value]) => ({
            name,
            value,
        }));
        this.forceBrowserCookies = forceBrowserCookies;
        this.parameter = {
            [parameterTypes.PATH]: new PathParameterHandler(trimStart(pathname, '/')),
            [parameterTypes.QUERY]: new SearchParameterHandler(searchParams),
            [parameterTypes.HASH]: new SearchParameterHandler(trimStart(hash, '#')),
            [parameterTypes.BODY]: new SearchParameterHandler(body),
        };
    }

    generateCombinations() {
        return Object.entries(this.parameter)
            .filter(([parameterType]) => isSendBodyHttpMethod(this.method) || parameterType !== parameterTypes.BODY)
            .map(([parameterType, parameter]) => {
                return Array(parameter.length).fill(true)
                    .map((_, index) => new RequestCombination({
                        type: parameterType,
                        index,
                        template: this,
                    }));
            })
            .reduce((all, array) => all.concat(array));
    }

    generateRequest({type, index, value}) {
        const {
            [parameterTypes.PATH]: path,
            [parameterTypes.QUERY]: query,
            [parameterTypes.HASH]: hash,
            [parameterTypes.BODY]: body,
        } = Object.entries(this.parameter).reduce((all, [parameterType, parameter]) => {
            all[parameterType] = parameter.generateModified(index, value, parameterType === type);
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
