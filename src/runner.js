const config = require('./config');
const {Builder, By, until} = require('selenium-webdriver');
const {sleep, getBaseUrl} = require('./utils');
const {logger} = require('./logging/logger');
const getSearchParameterCode = require('./browser/getSearchParameterCode');
const getSearchReflectionCode = require('./browser/getSearchReflectionCode');
const getSearchUrlsCode = require('./browser/getSearchUrlsCode');
const generatePayloads = require('./payloads/generatePayloads');
const RequestTemplateBuilder = require('./requests/RequestTemplateBuilder');
const addRequestTemplateBuilderFromDomUrls = require('./addRequestTemplateBuilderFromDomUrls');
const {parameterTypes, httpMethods} = require('./constents');

const searchForReflectionsCode = getSearchReflectionCode(config.searchKey);
const searchForParamsCode = getSearchParameterCode();
const searchUrlsCodeCode = getSearchUrlsCode();

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
            return true;
        }
    } while (startMillis + params.detectionTimeout > Date.now()) ;

    return false;
}

function testPayloads({driver, params, setProxyMods, payloads, combination}) {
    return payloads.reduce(async (promise, payload) => {
        if (await promise && !params.allPayloads) {
            return true;
        }
        const {
            url: requestUrl,
            mods,
            browserCookies
        } = combination.generateRequest(payload.payload);
        setProxyMods(mods);
        await setCookies({driver, cookies: browserCookies, requestUrl: requestUrl});
        const hasVulnerability = await testPayload({driver, params, requestUrl: requestUrl, payload});

        if (hasVulnerability) {
            const method = mods ? mods.method : httpMethods.GET;
            const targetUrl = mods ? mods.target + mods.targetUrl : requestUrl;
            const body = mods ? mods.body : '';
            logger.vuln(method, targetUrl, body);
        } else {
            logger.info('assertion was falsy');
        }
        return hasVulnerability;
    }, Promise.resolve(false));
}

async function testUrl({driver, params, setProxyMods, templates, template, combination}) {
    const {
        url: requestUrl,
        mods,
        browserCookies
    } = combination.generateRequest(config.searchKey);
    logger.info('check reflections of:', requestUrl);
    setProxyMods(mods);
    await setCookies({driver, cookies: browserCookies, requestUrl: requestUrl});
    if (!await request({driver, url: requestUrl})) {
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
        if (params.crawlDepth > 0 && params.crawlDepth > template.crawlDepth) {
            const domUrls = await driver.executeScript(searchUrlsCodeCode);
            const baseTargetUrl = mods ? mods.target : new URL(requestUrl).origin;
            addRequestTemplateBuilderFromDomUrls(params, templates, baseTargetUrl,
                domUrls, template.crawlDepth + 1, mods && mods.proxyParameter);
        }

        if (reflectionResult.reflections.length) {
            break;
        }
    } while (startMillis + params.detectionTimeout > Date.now()) ;

    const payloads = generatePayloads(reflectionResult.reflections);
    logger.info('payloads generated:', payloads.length);

    return testPayloads({driver, params, setProxyMods, payloads, combination});
}

async function runner({params, setProxyMods}) {
    let driver = null;
    try {
        const templates = params.urls.map(url => new RequestTemplateBuilder({
            rawUrl: url,
            proxyBaseUrl: `http://localhost:${params.proxyPort}`,
            method: params.method,
            body: params.body,
            headers: params.headers,
            cookies: params.cookies,
            forceBrowserCookies: params.forceBrowserCookies,
            crawlDepth: 0,
        }));
        for (let i = 0; i < templates.length; i++) {
            const template = templates[i];
            if (!template.requestCombinations.length) {
                logger.warn('no combinations to test for:', rawUrl);
            }

            for (let j = 0; j < template.requestCombinations.length; j++) {
                const combination = template.requestCombinations[j];
                if (!driver) {
                    driver = await new Builder().forBrowser('firefox').build();
                }
                let foundVulnerability = false;
                try {
                    foundVulnerability = await testUrl({
                        driver, params, setProxyMods, templates, template, combination,
                    });
                } catch (e) {
                    logger.error('checking page error:', e);
                }
                if (foundVulnerability && !params.allParams) {
                    break;
                }
            }
        }
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

module.exports = runner;
