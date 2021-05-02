const {generateRandomJsKeySelector, getTriggerCodeForClass, generateRandomClass} = require('./generators');
const htmlTagPayloads = require('./htmlTagPayloads');
const htmlNormalAttributePayloads = require('./htmlNormalAttributePayloads');
const htmlHrefAttributePayloads = require('./htmlHrefAttributePayloads');
const htmlExecuteAttributePayloads = require('./htmlExecuteAttributePayloads');
const htmlCommentPayloads = require('./htmlCommentPayloads');
const scriptPayloads = require('./scriptPayloads');
const {reflectionTypes} = require('../constents');

function generatePayloadCode(reflection) {
    const variableName = generateRandomJsKeySelector();
    const jsCode = `window[${variableName}]=1;`;
    const assert = `return window[${variableName}]`;

    const scriptTag = `<scRiPT>${jsCode}</SCrIpT>`;
    const imgTag = `<img src="/" onerror="${jsCode}">`;

    const tagClass = generateRandomClass();
    const aTag = `<a class="${tagClass}" href="jaVascRIPt:void(${jsCode});"></a>`;
    const pTag = `<p class="${tagClass}" onclick="${jsCode}"></p>`;
    const tagTrigger = getTriggerCodeForClass(tagClass);

    switch (reflection.type) {
        case  reflectionTypes.HTML_TAG:
            return htmlTagPayloads({
                scriptTag, imgTag, aTag, pTag, tagTrigger, assert,
            });
        case reflectionTypes.HTML_NORMAL_ATTRIBUTE:
            return htmlNormalAttributePayloads({
                reflection, scriptTag, imgTag, aTag, pTag, tagTrigger, assert,
            })
        case reflectionTypes.HTML_HREF_ATTRIBUTE:
            return htmlHrefAttributePayloads({
                jsCode, scriptTag, imgTag, aTag, pTag, tagTrigger, assert,
            });
        case reflectionTypes.HTML_EXECUTABLE_ATTRIBUTE:
            return htmlExecuteAttributePayloads({
                reflection, jsCode, scriptTag, imgTag, aTag, pTag, tagTrigger, assert,
            });
        case reflectionTypes.HTML_COMMENT:
            return htmlCommentPayloads({
                scriptTag, imgTag, aTag, pTag, tagTrigger, assert,
            });
        case reflectionTypes.SCRIPT:
            return scriptPayloads({
                jsCode, scriptTag, imgTag, aTag, pTag, tagTrigger, assert,
            });
    }
    return [];
}

function generatePayloads(reflections) {
    return reflections
        .map(generatePayloadCode)
        .reduce((all, current) => all.concat(current), []);
}

module.exports = generatePayloads;
