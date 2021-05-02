class RequestModifications {
    constructor({target, method, requestUrl, targetUrl, body, headers}) {
        this.target = target;
        this.method = method;
        this.requestUrl = requestUrl;
        this.targetUrl = targetUrl;
        this.body = body;
        this.headers = headers;
    }
}

module.exports = RequestModifications;
