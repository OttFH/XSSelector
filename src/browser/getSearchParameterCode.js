const {callFunctionCode} = require('../utils');

const searchFunction = () => {
    const inputElementSelector = 'input, textarea, select';

    const postFormInputs = [...document.querySelectorAll('form')]
        .filter(form => form.method && form.method.toLowerCase() === 'post')
        .map(form => [...form.querySelectorAll(inputElementSelector)]).flat()
        .filter(e => e.name);

    const otherInputs = [...document.querySelectorAll(inputElementSelector)]
        .filter(e => !postFormInputs.includes(e));


    function getDistinct(inputs) {
        return Object.entries(inputs.reduce((all, input) => {
            all[input.name] = all.value || input.value || '';
            return all;
        }, {})).map(([key, value]) => ({key, value}));
    }

    return {
        body: getDistinct(postFormInputs),
        query: getDistinct(otherInputs),
    }
}

function getSearchParameterCode() {
    return callFunctionCode(searchFunction);
}

module.exports = getSearchParameterCode;
