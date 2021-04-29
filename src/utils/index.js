function sleep(millis) {
    return new Promise(resolve => setInterval(resolve, millis));
}

function callFunctionCode(func, ...params) {
    return `return (${func.toString().split(/\\r?\\n/).filter(Boolean).map(line => line.trim()).join(' ')})(${params.map(JSON.stringify)})`;
}

function getBaseUrl(urlString) {
    const url = new URL(urlString);
    return url.origin;
}

module.exports = {
    sleep,
    callFunctionCode,
    getBaseUrl,
};
