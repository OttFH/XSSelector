class RequestModifications {
    constructor({target, method, requestUrl, targetUrl, body, headers, proxyParameter}) {
        this.target = target;
        this.method = method;
        this.requestUrl = requestUrl;
        this.targetUrl = targetUrl;
        this.body = body;
        this.headers = headers;
        this.proxyParameter = proxyParameter;
    }
}

module.exports = RequestModifications;
