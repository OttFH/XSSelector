function htmlCommentPayloads({reflection, jsCode, tagClass, htmlElements}) {
    return htmlElements.map(({tag, trigger}) => ({
        payload: ` -->${tag}<!-- `,
        trigger,
    }));
}

module.exports = htmlCommentPayloads;
