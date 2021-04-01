const {argTypes} = require('../args/argTypes');

function getFormattedNamesText(arg) {
    const names = [
        arg.shortName ? `-${arg.shortName}` : null,
        arg.longName ? `-${arg.longName}` : null,
    ].filter(Boolean);
    return `  ${names.join(', ')}    `;
}

function getFormattedValueText(arg) {
    return [
        arg.valueType ? `type: ${arg.valueType}` : null,
        arg.defaultValue ? `default: ${arg.defaultValue}` : null,
    ].filter(Boolean).join(', ');
}

function printHelp() {
    console.log('Usage: node ./index.js [options]');
    console.log('');

    const maxLongNameLength = Math.max(...argTypes.map(arg => getFormattedNamesText(arg).length));
    console.log('Options:');
    argTypes.forEach(arg => {
        console.log(getFormattedNamesText(arg).padEnd(maxLongNameLength, ' ') + arg.description);

        const formattedValueText = getFormattedValueText(arg);
        if (formattedValueText) {
            console.log(''.padEnd(maxLongNameLength, ' ') + formattedValueText);
        }
    });
}

module.exports = printHelp;