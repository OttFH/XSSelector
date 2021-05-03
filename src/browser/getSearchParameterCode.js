const {callFunctionCode} = require('../utils');

const searchFunction = () => {
    const inputElementSelector = 'input, textarea, select';

    function getDefaultValue(type) {
        switch (type) {
            case 'checkbox':
            case 'radio':
                return 1;
            case 'color':
                return '#000000';
            case 'date':
                return new Date().toISOString().split('T')[0];
            case 'datetime-local':
                return new Date().toISOString();
            case 'email':
                return 'examle@mail.com';
            case 'month':
                return new Date().toISOString().substr(0, 7);
            case 'number':
            case 'range':
            case 'select-one':
                return '234';
            case 'time':
                return new Date().toISOString().split('T')[1];
            case 'url':
                return 'www.example.com';
            case 'week':
                const now = new Date();
                const approximateWeek = Math.round((now.getMonth() * 30 + now.getDate()) / 7);
                return `${now.getFullYear()}-W${approximateWeek}`;
        }
        return null;
    }

    const postFormInputs = [...document.querySelectorAll('form')]
        .filter(form => form.method && form.method.toLowerCase() === 'post')
        .map(form => [...form.querySelectorAll(inputElementSelector)]).flat()
        .filter(e => e.name);

    const otherInputs = [...document.querySelectorAll(inputElementSelector)]
        .filter(e => !postFormInputs.includes(e));

    function getDistinct(inputs) {
        return Object.values(inputs.reduce((all, input) => {
            all[input.name] = {
                key: input.name,
                value: all[input.name] && all[input.name].value || input.value || input.checked || '',
                type: input.type,
            };
            return all;
        }, {})).map(({key, value, type}) => ({
            key,
            value: value || getDefaultValue(type),
        }));
    }

    return {
        body: getDistinct(postFormInputs),
        query: getDistinct(otherInputs),
    };
}

function getSearchParameterCode() {
    return callFunctionCode(searchFunction);
}

module.exports = getSearchParameterCode;
