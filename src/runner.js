const config = require('./config');
const {Builder, By, until} = require('selenium-webdriver');
const {sleep, getBaseUrl} = require('./utils');
const {logger} = require('./logging/logger');
const getSearchReflectionCode = require('./browser/getSearchReflectionCode');
const generatePayloads = require('./payloads/generatePayloads');
const generateRequestCombinations = require('./requests/generateRequestCombinations');

const searchForReflectionsCode = getSearchReflectionCode(config.searchKey);

async function setCookies({driver, cookies, requestUrl}) {
    if (cookies && cookies.length) {
        const currentUrl = await driver.getCurrentUrl();
        const baseRequestUrl = getBaseUrl(requestUrl);
        if (baseRequestUrl !== getBaseUrl(currentUrl)) {
            await driver.get(baseRequestUrl);
        }
        await Promise.all(cookies.map(cookie => driver.manage().addCookie(cookie)));
    }
}

async function request({driver, url}) {
    await driver.get(url);
    try {
        await driver.wait(until.elementLocated(By.tagName('body')), 5000);
        return true;
    } catch {
        return false;
    }
}

async function testPayload({driver, requestUrl, payload}) {
    if (!await request({driver, url: requestUrl})) {
        return false;
    }

    await sleep(200);
    if (payload.trigger) {
        const triggerResult = await driver.executeScript(payload.trigger);
        logger.debug('trigger result:', triggerResult);
    }

    const assertResult = await driver.executeScript(payload.assert);
    if (assertResult) {
        logger.vuln('payload:', payload.payload);
    } else {
        logger.info('assertion was falsy');
    }
    return !!assertResult;
}

async function testUrl({driver, params, setProxyMods, combination}) {
    const {
        url: refectionRequestUrl,
        mods: refectionMods,
        browserCookies: refectionCookies
    } = combination.generateRequest(config.searchKey);
    logger.info('check reflections of:', refectionRequestUrl);

    setProxyMods(refectionMods);
    await setCookies({driver, cookies: refectionCookies, requestUrl: refectionRequestUrl});
    if (!await request({driver, url: refectionRequestUrl})) {
        return false;
    }

    await sleep(200);
    const reflectionResult = await driver.executeScript(searchForReflectionsCode);
    (reflectionResult.logs || []).forEach(logger.log);

    const payloads = generatePayloads(reflectionResult.reflections);
    logger.info('payloads generated:', payloads.length);

    return payloads.reduce(async (promise, payload) => {
        if (await promise && !params.allPayloads) {
            return true;
        }
        const {
            url: payloadRequestUrl,
            mods,
            browserCookies: payloadCookies
        } = combination.generateRequest(payload.payload);
        setProxyMods(mods);
        await setCookies({driver, cookies: payloadCookies, requestUrl: payloadRequestUrl});
        return testPayload({driver, requestUrl: payloadRequestUrl, payload});
    }, Promise.resolve(false));
}

async function runner({params, setProxyMods}) {
    let driver = null;
    try {
        await params.urls.reduce(async (preRawUrlsPromise, rawUrl) => {
            await preRawUrlsPromise;

            const combinations = generateRequestCombinations({params, rawUrl});
            if (!combinations.length) {
                logger.warn('no combinations to test for:', rawUrl);
                return;
            }

            await combinations.reduce(async (preCombinationPromise, combination) => {
                if (await preCombinationPromise && !params.allParams) {
                    return true;
                }
                if (!driver) {
                    driver = await new Builder().forBrowser('firefox').build();
                }
                try {
                    return testUrl({driver, params, setProxyMods, combination})
                } catch (e) {
                    logger.error('checking page error:', e);
                    return false;
                }
            }, Promise.resolve(false));
        }, Promise.resolve());
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

module.exports = runner;
