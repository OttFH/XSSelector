const config = require('../config');
const {callFunctionCode} = require('../utils');

function generateRandomJsKeySelector(length = 6) {
    const charCodes = config.payloadVariablePrefix.split('').map(c => c.charCodeAt(0)).join();
    const randomNumber = Math.random().toString().slice(-length);
    return `String.fromCharCode(${charCodes})+${randomNumber}`;
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

module.exports={
    generateRandomJsKeySelector,
    generateRandomClass,
    getTriggerCodeForClass,
    getTriggerCodeForCode,
}
