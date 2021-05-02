const {ifTruthy, deepClone} = require('../utils');

class SearchParameterHandler {
    static parse(source) {
        let searchParams = null;
        switch (typeof source) {
            case 'string':
                searchParams = new URLSearchParams(source);
                break;

            case 'object':
                searchParams = source;
                break;
        }

        return new SearchParameterHandler(searchParams ? [...searchParams].map(([key, value]) => ({
            key,
            value,
        })) : []);
    }

    constructor(params) {
        this.params = params;
    }

    get length() {
        return this.params.length;
    }

    containsKey(searchKey) {
        return this.params.some(({key}) => key === searchKey);
    }

    add(key, value) {
        return this.params.push({key, value}) - 1;
    }

    generate() {
        return this.generateModified(null, null, false);
    }

    generateModified(index, value, modify = true) {
        let params = this.params;
        if (modify) {
            params = deepClone(params);
            if (params[index].value) {
                params[index].value = encodeURIComponent(value);
            } else {
                params[index].key = encodeURIComponent(value);
            }
        }
        return params.map(({key, value}) => `${key}${ifTruthy(value, '=')}`).join('&');
    }

    clone() {
        return new SearchParameterHandler(deepClone(this.params));
    }
}

module.exports = SearchParameterHandler;
