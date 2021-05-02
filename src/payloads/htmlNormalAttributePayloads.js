const {getTriggerCodeForClass, getTriggerCodeForCode} = require('./generators');

function htmlNormalAttributePayloads({reflection, jsCode, tagClass, htmlElements}) {
    const exitStrings = ['"', "'", ''];
    const executeAttributes = [{name: 'onclick', action: 'click'}, {
        name: 'autofocus/onfocus',
        action: 'focus',
    }];
    return [
        ...htmlElements.map(({tag, trigger}) => exitStrings.map(exit => ({
            payload: `${exit}>${tag}`,
            trigger,
        }))).flat(),
        ...executeAttributes.map(({name: attribute, action}) => exitStrings.map(exit => ({
            payload: `${exit} ${attribute}=${jsCode} class=${tagClass}/${exit}`,
            trigger: getTriggerCodeForClass(tagClass, action),
        }))).flat(),
        ...executeAttributes.map(({name: attribute}) => exitStrings.map(exit => ({
            payload: `${exit} ${attribute}=${jsCode} ${exit}`,
            trigger: getTriggerCodeForCode(jsCode),
        }))).flat(),
    ];
}

module.exports = htmlNormalAttributePayloads;
