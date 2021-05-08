const {httpMethods, codeModeStepTypes} = require('../constents');
const {until, By} = require('selenium-webdriver');
const setCookies = require('../setBrowserCookies');
const BrowserRequest = require('../requests/BrowserRequest');
const axios = require('axios');
const {logger} = require("../logging/logger");
const {trimStart, parseBrowserCookies} = require('../utils');

function buildBrowserRequest(params, {
    url,
    method,
    body,
    headers,
    cookies,
    useBrowserCookies,
}) {
    const {origin, pathname, search, hash} = new URL(url);

    return BrowserRequest.build({
        baseUrl: origin,
        proxyPort: params.proxyPort,
        method: method || params.method || httpMethods.GET,
        headers: headers || params.headers || {},
        cookies: ((cookies || []).map(({name, value}) => `${name}=${value}`) || params.cookies || []).join(';'),
        browserCookies: cookies || parseBrowserCookies(params.cookies),
        forceBrowserCookies: useBrowserCookies !== undefined ? useBrowserCookies : params.forceBrowserCookies,
        path: trimStart(pathname, '/'),
        query: trimStart(search, '?'),
        hash: trimStart(hash, '#'),
        body,
    });
}

async function runStep({driver, params, proxy, payload, results, createStep}) {
    const step = await createStep({
        driver,
        payload,
        previousResult: results[results.length - 1],
        results: [...results],
    });

    try {
        switch (step.type) {
            case codeModeStepTypes.BROWSER_REQUEST:
                const browserRequest = buildBrowserRequest(params, step);
                proxy.currentMods = browserRequest.modifications;
                await setCookies({
                    driver,
                    cookies: browserRequest.cookies,
                    requestUrl: browserRequest.url,
                });
                await driver.get(browserRequest.url);
                await driver.wait(until.elementLocated(By.tagName('body')), 5000);
                results.push(null);
                break;

            case codeModeStepTypes.BROWSER_SCRIPT:
                const scriptResult = await driver.executeScript(step.script);
                results.push(scriptResult);
                break;


            case codeModeStepTypes.AXIOS_REQUEST:
                const response = await axios(step.config);
                results.push(response);
                break;

            case codeModeStepTypes.RESULT:
                results.push(step.result);
                break;

            default:
                logger.warn(`Code mode type "${step.type}" is not supported.`);
                break;
        }
    } catch (e) {
        logger.warn(`Code mode error: ${e.message}`);
        results.push(e);
    }
}

module.exports = {
    runStep,
}
