function sleep(millis) {
    return new Promise(resolve => setInterval(resolve, millis));
}

module.exports = {
    sleep,
};