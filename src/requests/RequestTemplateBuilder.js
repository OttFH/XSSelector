const PathParameterHandler = require('./PathParameterHandler');
const SearchParameterHandler = require('./SearchParameterHandler');
const RequestCombination = require('./RequestCombination');
const RequestTemplate = require('./RequestTemplate');
const config = require('../config');
const {deepClone, trimStart, parseBrowserCookies} = require('../utils');
const {httpMethods, parameterTypes} = require('../constents');

function isSendBodyHttpMethod(method) {
    return [httpMethods.POST, httpMethods.PUT, httpMethods.DELETE].includes(method);
}

class RequestTemplateBuilder {
    constructor({rawUrl, proxyPort, method, body, headers, cookies, forceBrowserCookies, crawlDepth}) {
        const {origin, pathname, searchParams, hash} = new URL(rawUrl);
        this.source = rawUrl;
        this.rawBody = body;
        this.baseUrl = origin;
        this.proxyPort = proxyPort;
        this.method = method;
        this.headers = headers || {};
        this.cookies = (cookies || []).join(';');
        this.browserCookies = parseBrowserCookies(cookies);
        this.forceBrowserCookies = forceBrowserCookies;
        this.crawlDepth = crawlDepth;
        this.parameters = {
            [parameterTypes.PATH]: PathParameterHandler.parse(trimStart(pathname, '/')),
            [parameterTypes.QUERY]: SearchParameterHandler.parse(searchParams),
            [parameterTypes.HASH]: SearchParameterHandler.parse(trimStart(hash, '#')),
            [parameterTypes.BODY]: SearchParameterHandler.parse(body),
        };
        this._requestCombinations = [this.generateRequestCombination(null, 0)];
        this._requestCombinations.push(...this.generateCombinations());
    }

    equals(other) {
        return this.source === other.source &&
            this.rawBody === other.rawBody &&
            this.proxyPort === other.proxyPort &&
            this.method === other.method &&
            JSON.stringify(this.headers) === JSON.stringify(other.headers) &&
            JSON.stringify(this.cookies) === JSON.stringify(other.cookies) &&
            this.forceBrowserCookies === other.forceBrowserCookies;
    }

    cloneParameters() {
        const clone = {};
        Object.keys(this.parameters).forEach(key => clone[key] = this.parameters[key].clone());
        return clone;
    }

    generateTemplate(overrideMethod) {
        return new RequestTemplate({
            baseUrl: this.baseUrl,
            proxyPort: this.proxyPort,
            method: overrideMethod || this.method,
            headers: this.headers,
            cookies: deepClone(this.cookies),
            browserCookies: deepClone(this.browserCookies),
            forceBrowserCookies: this.forceBrowserCookies,
            parameters: this.cloneParameters(),
        });
    }

    generateRequestCombination(type, index, overrideMethod = null) {
        return new RequestCombination({
            type,
            index,
            template: this.generateTemplate(overrideMethod),
        })
    }

    generateCombinations() {
        return Object.entries(this.parameters)
            .filter(([parameterType]) => isSendBodyHttpMethod(this.method) || parameterType !== parameterTypes.BODY)
            .map(([parameterType, parameter]) => {
                return Array(parameter.length).fill(true)
                    .map((_, index) => this.generateRequestCombination(parameterType, index));
            })
            .flat();
    }

    get requestCombinations() {
        return this._requestCombinations;
    }

    /**
     * Adds new RequestCombinations to requestCombinations if they don't exists yet.
     * @param parameters {{type: string, key: string, value: string}[]} list of parameter
     * @returns {void}
     */
    addParameters(parameters) {
        const newRequestCombinations = parameters
            .filter(({type, key}) => this.parameters[type] && !this.parameters[type].containsKey(key))
            .map((parameter) => ({
                ...parameter,
                index: this.parameters[parameter.type].add(parameter.key, parameter.value || config.searchKey),
            }))
            .map(({type, index}) => {
                const overrideMethod = type === parameterTypes.BODY ? httpMethods.POST : null;
                return this.generateRequestCombination(type, index, overrideMethod);
            });

        this._requestCombinations.push(...newRequestCombinations);
    }
}

module.exports = RequestTemplateBuilder;
