const {ifTruthy} = require('../utils');

class SearchParameterHandler {
    constructor(source) {
        let searchParams = null;
        switch (typeof source) {
            case 'string':
                searchParams = new URLSearchParams(source);
                break;

            case 'object':
                searchParams = source;
                break;
        }

        this.params = searchParams ? [...searchParams].map(([key, value]) => ({
            key,
            value,
        })) : [];
    }

    get length() {
        return this.params.length;
    }

    generate() {
        return this.generateModified(null, null, false);
    }

    generateModified(index, value, modify) {
        let params = this.params;
        if (modify) {
            params = JSON.parse(JSON.stringify(params));
            if (params[index].value) {
                params[index].value = encodeURIComponent(value);
            } else {
                params[index].key = encodeURIComponent(value);
            }
        }
        return params.map(({key, value}) => `${key}${ifTruthy(value, '=')}`).join('&');
    }
}

module.exports = SearchParameterHandler;
