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
        return 'text';
    }

    function getDomUrl(form) {
        const parameters = [...form.querySelectorAll(inputElementSelector)].filter(input => input.name)
            .map(input => ({
                key: input.name,
                value: encodeURIComponent(input.value || input.checked || getDefaultValue(input.type)),
            }));
        return {
            method: form.method.toUpperCase(),
            url: form.action.substr(new URL(form.action).origin.length),
            parameters,
        };
    }

    const domeUrls = [
        ...[...document.querySelectorAll('a')]
            .map(a => a.href)
            .filter(href => href && href.startsWith(window.location.origin))
            .map(url => ({
                method: 'GET',
                url: url.substr(new URL(url).origin.length),
                parameters: [],
            })),
        ...[...document.querySelectorAll('form')].map(getDomUrl),
    ];

    return domeUrls.filter(url1 => !domeUrls.some(url2 => url2 !== url1 && JSON.stringify(url2) === JSON.stringify(url1)));
}

function getSearchUrlsCode() {
    return callFunctionCode(searchFunction);
}

module.exports = getSearchUrlsCode;
