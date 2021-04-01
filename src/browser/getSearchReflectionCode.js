const {callFunctionCode} = require('../utils');

const searchFunction = (key) => {
    let result = {
        reflections: [],
        logs: [],
    };
    let reflectionTypes = {
        HTML_TAG: 'html_tag',
        HTML_NORMAL_ATTRIBUTE: 'html_normal_attribute',
        HTML_HREF_ATTRIBUTE: 'html_href_attribute',
        HTML_EXECUTABLE_ATTRIBUTE: 'html_executable_attribute',
        HTML_COMMENT: 'html_comment',
        SCRIPT: 'script',
    };

    function countKey(text) {
        let count = 0;
        let lastIndex = -1;
        while (true) {
            lastIndex = text.indexOf(key, lastIndex + 1);
            if (lastIndex === -1) return count;
            count++;
        }
    }

    function getAttributeReflectionType(name) {
        name = name.toLowerCase();
        if (name === 'href') {
            return reflectionTypes.HTML_HREF_ATTRIBUTE;
        }
        return name.startsWith('on') ?
            reflectionTypes.HTML_EXECUTABLE_ATTRIBUTE :
            reflectionTypes.HTML_NORMAL_ATTRIBUTE;
    }

    function joinList(list, separator = ' ') {
        let sum = '';
        for (let i = 0; list && i < list.length; i++) {
            if (sum) {
                sum += separator + list[i];
            } else {
                sum = list[i]
            }
        }
        return sum;
    }

    function addReflection(type, node, parent) {
        result.reflections.push({
            type,
            nodeType: node.type,
            nodeName: node.nodeName,
            nodeId: node.id,
            nodeClass: joinList(node.classList),
            parentType: parent.type,
            parentName: parent.nodeName,
            parentId: parent.id,
            parentClass: joinList(parent.classList),
        });
    }

    function log(type, text) {
        result.logs.push({
            type,
            text,
        });
    }

    function find(node, parent) {
        switch (node.nodeType) {
            case 1:
                break;
            case 2:
                if (countKey(node.nodeValue)) {
                    addReflection(getAttributeReflectionType(node.nodeName), node, parent);
                }
                return;
            case 3:
                if (countKey(node.nodeValue)) {
                    addReflection(parent.nodeName.toLowerCase() === 'script' ?
                        reflectionTypes.SCRIPT : reflectionTypes.HTML_TAG, node, parent);
                }
                return;
            case 8:
                if (countKey(node.nodeValue)) {
                    addReflection(reflectionTypes.HTML_COMMENT, node, parent);
                }
                return;
            case 9:
                find(node.children[0], node);
                return;
            default:
                log('info', `Node type is not implemented: ${node.nodeType}`);
                return;
        }

        let outerCount = countKey(node.outerHTML, key);
        if (!outerCount) return;

        let innerCount = countKey(node.innerHTML, key);
        if (innerCount && node.hasChildNodes()) {
            node.childNodes.forEach(function (child) {
                return find(child, node)
            });
        }

        if (outerCount !== innerCount) {
            for (let i = 0; i < node.attributes.length; i++) {
                find(node.attributes[i], node);
            }
        }
    }

    find(document);
    return result;
};

function getSearchReflectionCode(key) {
    return callFunctionCode(searchFunction, key);
}

module.exports = getSearchReflectionCode;