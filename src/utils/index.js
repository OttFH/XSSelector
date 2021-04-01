function sleep(millis) {
    return new Promise(resolve => setInterval(resolve, millis));
}

function callFunctionCode(func, ...params){
    return `return (${func.toString().split(/\\r?\\n/).filter(Boolean).map(line => line.trim()).join(' ')})(${params.map(JSON.stringify)})`;
}

module.exports = {
    sleep,
    callFunctionCode,
};