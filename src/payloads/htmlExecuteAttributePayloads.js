const {getTriggerCodeForClass, getTriggerCodeForCode} = require('./generators');
const htmlNormalAttributePayloads = require('./htmlNormalAttributePayloads');

function htmlExecuteAttributePayloads(data) {
    const {reflection, jsCode, tagClass} = data;
    const exitStrings = ['"', "'", ''];
    return [
        {
            payload: jsCode,
            trigger: getTriggerCodeForCode(jsCode),
        },
        ...exitStrings.map(exit => ({
            payload: `${jsCode}${exit} class=${tagClass}/${exit}`,
            trigger: getTriggerCodeForClass(tagClass, reflection.nodeName),
        })),
        ...htmlNormalAttributePayloads(data)
    ];
}

module.exports = htmlExecuteAttributePayloads;
