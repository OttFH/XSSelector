const {logger} = require('../logging/logger');

class CodeModeTemplateBuilder {
    constructor({path}) {
        this.source = path;
        try {
            const steps = require(`../../${path}`);
            if (Array.isArray(steps)) {
                if (steps.every(step => typeof step === 'function')) {
                    this._requestCombinations = [
                        steps,
                    ];
                } else {
                    logger.warn(`Export of file "${path}" is not array of functions.`);
                }
            } else {
                logger.warn(`Export of file "${path}" does not export an array.`);
            }
        } catch (e) {
            logger.error(`error on loading code mode steps:Export: ${e.message}`);
            this._requestCombinations = [];
        }
    }

    get requestCombinations() {
        return this._requestCombinations;
    }

    addParameters() {
        // Not supported by code mode
    }
}

module.exports = CodeModeTemplateBuilder;
