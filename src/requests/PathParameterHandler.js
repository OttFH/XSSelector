class PathParameterHandler {
    constructor(rawPath) {
        this.params = rawPath.split('/').map(value => ({
            value,
        }));
    }

    get length() {
        return this.params.length;
    }

    generateModified(index, value, modify) {
        let params = this.params;
        if (modify) {
            params = JSON.parse(JSON.stringify(params));
            params[index].value = encodeURIComponent(value);
        }
        return params.map(({value}) => value).join('/');
    }
}

module.exports = PathParameterHandler;
