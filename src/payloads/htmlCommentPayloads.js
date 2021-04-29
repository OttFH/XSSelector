function htmlCommentPayloads({scriptTag, imgTag, aTag, pTag,tagTrigger, assert}) {
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
    }];
}

module.exports = htmlCommentPayloads;
