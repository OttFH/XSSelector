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

function startProxy(port) {
    let currentMods = null;
    let latestTarget = null;
    const proxy = httpProxy.createProxyServer({});
    const server = http.createServer((req, res,) => {
        if (requestHandler(req, res, proxy, latestTarget, currentMods)) {
            currentMods = null;
        }
    });

    server.listen(port);

    return function (mods) {
        currentMods = mods;
        if (mods) latestTarget = mods.target;
    }
}

module.exports = startProxy;
