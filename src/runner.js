const config = require('./config');
const {Builder, By, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const {sleep} = require('./utils');
const {logger} = require('./logging/logger');
const getSearchParameterCode = require('./browser/getSearchParameterCode');
const getSearchReflectionCode = require('./browser/getSearchReflectionCode');
const getSearchUrlsCode = require('./browser/getSearchUrlsCode');
const generatePayloads = require('./payloads/generatePayloads');
const addRequestTemplateBuilderFromDomUrls = require('./addRequestTemplateBuilderFromDomUrls');
const setCookies = require('./setBrowserCookies');
const RequestCombination = require('./requests/RequestCombination');
const getTemplateBuilder = require('./args/getTemplateBuilder');
const {runStep} = require('./codeMode');
const {parameterTypes, httpMethods} = require('./constents');

const searchForReflectionsCode = getSearchReflectionCode(config.searchKey);
const searchForParamsCode = getSearchParameterCode();
const searchUrlsCodeCode = getSearchUrlsCode();

async function request({driver, params, proxy, payload, steps}) {
    if (steps instanceof RequestCombination) { // normal mode
        const {
            url: requestUrl,
            modifications,
            cookies
        } = steps.generateRequest(payload);
        proxy.currentMods = modifications;
        await setCookies({
            driver,
            cookies: cookies,
            requestUrl: requestUrl,
        });
        await driver.get(requestUrl);
    } else { // code mode
        const results = [];
        await steps.reduce(async (promise, createStep, index) => {
            await promise;

            return runStep({
                driver, params, proxy, payload, results, index, createStep,
            });
        }, Promise.resolve());
    }

    try {
        await driver.wait(until.elementLocated(By.tagName('body')), 5000);
        return true;
    } catch (e) {
        return false;
    }
}

async function testPayload({driver, params, proxy, payload, steps}) {
    if (!await request({
        driver, params, proxy, payload: payload.payload, steps,
    })) {
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

function testPayloads({driver, params, proxy, payloads, steps}) {
    return payloads.reduce(async (promise, payload) => {
        if (await promise && !params.allPayloads) {
            return true;
        }
        const hasVulnerability = await testPayload({
            driver, params, proxy, payload, steps,
        });

        if (hasVulnerability) {
            const currentUrl = await driver.getCurrentUrl();
            const mods = proxy.currentMods;
            const method = mods ? mods.method : httpMethods.GET;
            const targetUrl = mods ? mods.target + mods.targetUrl : currentUrl;
            const body = mods ? mods.body : '';
            logger.vuln(method, targetUrl, body);
        } else {
            logger.info('assertion was falsy');
        }
        return hasVulnerability;
    }, Promise.resolve(false));
}

async function testUrl({driver, params, proxy, templates, template, steps}) {
    if (!await request({
        driver, params, proxy, payload: config.searchKey, steps,
    })) {
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
            const currentUrl = await driver.getCurrentUrl();
            const mods = proxy.currentMods;
            const baseTargetUrl = mods ? mods.target : new URL(currentUrl).origin;
            addRequestTemplateBuilderFromDomUrls(params, templates, baseTargetUrl,
                domUrls, template.crawlDepth + 1, mods && mods.proxyParameter);
        }

        if (reflectionResult.reflections.length) {
            break;
        }
    } while (startMillis + params.detectionTimeout > Date.now()) ;

    const payloads = generatePayloads(reflectionResult.reflections);
    logger.info('payloads generated:', payloads.length);

    return testPayloads({driver, params, proxy, payloads, steps});
}

async function runner({params, proxy}) {
    let driver = null;
    try {
        const templates = getTemplateBuilder(params);
        for (let i = 0; i < templates.length; i++) {
            const template = templates[i];
            if (!template.requestCombinations.length) {
                logger.warn('no combinations to test for:', template.source);
            }

            for (let j = 0; j < template.requestCombinations.length; j++) {
                const steps = template.requestCombinations[j];
                if (!driver) {
                    const firefoxOptions = new firefox.Options().windowSize({
                        width: 1280,
                        height: 960,
                    });
                    if (params.headless) firefoxOptions.headless();
                    driver = await new Builder()
                        .forBrowser('firefox')
                        .setFirefoxOptions(firefoxOptions)
                        .build();
                }
                let foundVulnerability = false;
                try {
                    foundVulnerability = await testUrl({
                        driver, params, proxy, templates, template, steps,
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
