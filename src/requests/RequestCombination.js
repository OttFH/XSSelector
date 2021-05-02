class RequestCombination {
    constructor({type, index, template}) {
        this.type = type;
        this.index = index;
        this.template = template;
    }

    generateRequest(value) {
        return this.template.generateRequest({
            type: this.type,
            index: this.index,
            value,
        });
    }
}

module.exports = RequestCombination;
