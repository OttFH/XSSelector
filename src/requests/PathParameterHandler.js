const {deepClone} = require('../utils');

class PathParameterHandler {
    static parse(rawPath) {
        return new PathParameterHandler(rawPath.split('/').map(value => ({
            value,
        })));
    }

    constructor(params) {
        this.params = params;
    }

    get length() {
        return this.params.length;
    }

    generate() {
        return this.generateModified(null, null, false);
    }

    generateModified(index, value, modify = true) {
        let params = this.params;
        if (modify) {
            params = deepClone(params);
            params[index].value = encodeURIComponent(value);
        }
        return params.map(({value}) => value).join('/');
    }

    clone() {
        return new PathParameterHandler(deepClone(this.params));
    }
}

module.exports = PathParameterHandler;
