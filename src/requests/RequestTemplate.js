const BrowserRequest = require('./BrowserRequest');
const {parameterTypes} = require('../constents');

class RequestTemplate {
    constructor({
                    baseUrl,
                    proxyPort,
                    method,
                    headers,
                    cookies,
                    browserCookies,
                    forceBrowserCookies,
                    parameters
                }) {
        this.baseUrl = baseUrl;
        this.proxyPort = proxyPort;
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

        return BrowserRequest.build({
            baseUrl: this.baseUrl,
            proxyPort: this.proxyPort,
            method: this.method,
            headers: this.headers,
            cookies: this.cookies,
            browserCookies: this.browserCookies,
            forceBrowserCookies: this.forceBrowserCookies,
            path,
            query,
            hash,
            body,
        });
    }
}

module.exports = RequestTemplate;
