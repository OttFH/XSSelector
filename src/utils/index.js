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

/**
 * Adds prefix to value or condition if condition is truthy, otherwise returns value
 * @param condition {any}
 * @param prefix {string} text to add before value or condition if condition is truthy.
 * @param value {string} value to prefix or not.
 * @returns {string}
 */
function ifTruthy(condition, prefix, value = '') {
    return condition ? `${prefix}${value || condition}` : value;
}

function removeUndefined(obj) {
    Object.keys(obj).filter(key => obj[key] === undefined).forEach(key => {
        delete obj[key];
    });
    return obj;
}

module.exports = {
    sleep,
    callFunctionCode,
    getBaseUrl,
    ifTruthy,
    removeUndefined,
};
