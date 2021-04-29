class Arg {
    constructor({shortName, longName, defaultValue, valueType, description, isHierarchical = false}) {
        this.shortName = shortName;
        this.longName = longName;
        this.defaultValue = defaultValue;
        this.valueType = valueType;
        this.description = description;
        this.isHierarchical = isHierarchical;

        if (!valueType && typeof defaultValue !== 'undefined') {
            this.valueType = typeof defaultValue;
        }
    }

    isArg(arg) {
        return arg === `-${this.shortName}` || arg === `--${this.longName}`;
    }
}

module.exports = Arg;
