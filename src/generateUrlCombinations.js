class UrlCombination {
    constructor({prefix, suffix}) {
        this.prefix = prefix;
        this.suffix = suffix;
    }

    generate(value) {
        return `${this.prefix}${encodeURIComponent(value)}${this.suffix}`;
    }
}

function generateUrlCombinations(urlString) {
    const url = new URL(urlString);
    const query = [...url.searchParams].map(pair => ({
        key: pair[0],
        value: pair[1],
    }));
    return query.map((_, i) => {
        let prefix = `${url.origin}${url.pathname}?`;
        let suffix = '';
        for (let j = 0; j < query.length; j++) {
            if (i < j) {
                prefix += `${query[j].key}=${query[j].value}&`;
            } else if (i === j) {
                prefix += `${query[j].key}=`;
            } else {
                suffix += `&${query[j].key}=${query[j].value}`;
            }
        }
        suffix += url.hash;
        return new UrlCombination({prefix, suffix});
    });
}

module.exports = generateUrlCombinations;