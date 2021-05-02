const config = require('./config');
const {Builder, By, until} = require('selenium-webdriver');
const {sleep, getBaseUrl} = require('./utils');
const {logger} = require('./logging/logger');
const getSearchParameterCode = require('./browser/getSearchParameterCode');
const getSearchReflectionCode = require('./browser/getSearchReflectionCode');
const generatePayloads = require('./payloads/generatePayloads');
const RequestTemplateBuilder = require('./requests/RequestTemplateBuilder');
const {parameterTypes} = require('./constents');

const searchForReflectionsCode = getSearchReflectionCode(config.searchKey);
const searchForParamsCode = getSearchParameterCode();

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

async function testPayload({driver, params, requestUrl, payload}) {
    if (!await request({driver, url: requestUrl})) {
        return false;
    }

    let assertResult;
    const startMillis = Date.now();
    do {
        if (payload.trigger) {
            await sleep(10);
            const triggerResult = await driver.executeScript(payload.trigger);
            logger.debug('trigger result:', triggerResult);
        }

        assertResult = await driver.executeScript(payload.assert);
        if (assertResult) {
            break;
        }
    } while (startMillis + params.detectionTimeout > Date.now()) ;

    if (assertResult) {
        logger.vuln('payload:', payload.payload);
    } else {
        logger.info('assertion was falsy');
    }
    return !!assertResult;
}

async function testUrl({driver, params, setProxyMods, template, combination}) {
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

    let reflectionResult;
    const startMillis = Date.now();
    do {
        await sleep(10);
        reflectionResult = await driver.executeScript(searchForReflectionsCode);
        (reflectionResult.logs || []).forEach(logger.log);

        if (params.searchParams) {
            const domParameters = await driver.executeScript(searchForParamsCode);
            template.addParameters([
                ...domParameters.body.map(data => ({
                    ...data,
                    type: parameterTypes.BODY,
                })),
                ...domParameters.query.map(data => ({
                    ...data,
                    type: parameterTypes.QUERY,
                })),
            ]);
        }

        if (reflectionResult.reflections.length) {
            break;
        }
    } while (startMillis + params.detectionTimeout > Date.now()) ;

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
        return testPayload({driver, params, requestUrl: payloadRequestUrl, payload});
    }, Promise.resolve(false));
}

async function runner({params, setProxyMods}) {
    let driver = null;
    try {
        await params.urls.reduce(async (preRawUrlsPromise, rawUrl) => {
            await preRawUrlsPromise;

            const template = new RequestTemplateBuilder({
                rawUrl,
                proxyBaseUrl: `http://localhost:${params.proxyPort}`,
                method: params.method,
                body: params.body,
                headers: params.headers,
                cookies: params.cookies,
                forceBrowserCookies: params.forceBrowserCookies
            });
            if (!template.requestCombinations.length) {
                logger.warn('no combinations to test for:', rawUrl);
            }

            for (let i = 0; i < template.requestCombinations.length; i++) {
                const combination = template.requestCombinations[i];
                if (!driver) {
                    driver = await new Builder().forBrowser('firefox').build();
                }
                let foundVulnerability = false;
                try {
                    foundVulnerability = await testUrl({
                        driver, params, setProxyMods, template, combination,
                    })
                } catch (e) {
                    logger.error('checking page error:', e);
                }
                if (foundVulnerability && !params.allParams) {
                    return true;
                }
            }
        }, Promise.resolve());
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

module.exports = runner;
