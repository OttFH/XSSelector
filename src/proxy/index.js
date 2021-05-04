const http = require('http');
const https = require('https');
const streamify = require('stream-array');
const httpProxy = require('http-proxy');
const {removeUndefined} = require('../utils');

function replaceReferer(referer, proxyHost, targetUrl) {
    const proxyUrl = `http://${proxyHost}`;
    return referer ? referer.replace(proxyUrl, targetUrl) : undefined;
}

function requestHandler(req, res, proxy, latestTarget, mods) {
    const {host, protocol} = new URL(latestTarget);
    const options = {
        target: latestTarget,
        followRedirects: true,
        agent: protocol === 'https:' ? https.globalAgent : undefined,
        headers: removeUndefined({
            host: host,
            referer: replaceReferer(req.headers.referer, req.headers.host, latestTarget),
        }),
    };
    if (mods && req.url === mods.requestUrl) {
        req.url = mods.targetUrl;
        if (mods.method) req.method = mods.method;
        if (mods.headers) {
            options.headers = removeUndefined({
                ...options.headers,
                ...mods.headers,
                cookie: [
                    req.headers.cookie || '',
                    mods.headers.cookie || '',
                ].filter(Boolean).join(';') || undefined,
            });
        }
        if (mods.body !== undefined) options.buffer = streamify([mods.body]);
        proxy.web(req, res, options);
        return true;
    } else {
        // don't modify other requests like static CSS or JS files and data requests
        proxy.web(req, res, options);
        return false;
    }
}

class InternalProxy {
    constructor() {
        this._currentMods = null;
        this.disableMods = true;
        this.latestTarget = null;
    }

    start(port) {
        const proxy = httpProxy.createProxyServer({});
        const server = http.createServer((req, res,) => {
            if (requestHandler(req, res, proxy, this.latestTarget, this.disableMods ? null : this.currentMods)) {
                this.disableMods = true;
            }
        });

        server.listen(port);
    }

    get currentMods() {
        return this._currentMods;
    }

    set currentMods(mods) {
        this._currentMods = mods;
        this.disableMods = false;
        if (mods) this.latestTarget = mods.target;
    }
}

function startProxy(port) {
    const proxy = new InternalProxy();
    proxy.start(port);
    return proxy;
}

module.exports = startProxy;
