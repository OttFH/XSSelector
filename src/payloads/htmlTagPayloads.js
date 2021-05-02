function htmlTagPayloads({reflection, jsCode, tagClass, htmlElements}) {
    return htmlElements.map(({tag, trigger}) => ({
        payload: tag,
        trigger,
    }));
}

module.exports = htmlTagPayloads;
