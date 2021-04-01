class Arg {
    constructor({shortName, longName, defaultValue, valueType, description}) {
        this.shortName = shortName;
        this.longName = longName;
        this.defaultValue = defaultValue;
        this.valueType = valueType;
        this.description = description;

        if (!valueType && typeof defaultValue !== 'undefined') {
            this.valueType = typeof defaultValue;
        }
    }

    isArg(arg) {
        return arg === `-${this.shortName}` || arg === `--${this.longName}`;
    }
}

module.exports = Arg;