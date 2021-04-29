const config = require('./config');
const {Builder, By, until} = require('selenium-webdriver');
const {sleep,getBaseUrl} = require('./utils');
const {logger} = require('./logging/logger');
const getSearchReflectionCode = require('./browser/getSearchReflectionCode');
const generatePayloads = require('./payloads/generatePayloads');
const generateUrlCombinations = require('./generateUrlCombinations');
const printHelp = require('./utils/printHelp');

const searchForReflectionsCode = getSearchReflectionCode(config.searchKey);

// TODO: add other HTTP-Headers
// TODO: add other HTTP methods
// TODO: add code mode
// TODO: add Parameter selection
// TODO: add more payloads
// TODO: add crawl mode
// TODO: update README
// TODO: fix starting with npm

async function setCookies({driver, params, urlToCheck}) {
    if (params.cookies.length) {
        const currentUrl = await driver.getCurrentUrl();
        const baseUrlToCheck = getBaseUrl(urlToCheck);
        if (baseUrlToCheck !== getBaseUrl(currentUrl)) {
            await driver.get(baseUrlToCheck);
        }
        await Promise.all(params.cookies.map(cookie => driver.manage().addCookie(cookie)));
    }
}

async function testPayload({driver, params, checkUrl, payload}) {
    const urlToCheck = checkUrl.generate(payload.payload);
    await setCookies({driver, params, urlToCheck});
    await driver.get(urlToCheck);
    await driver.wait(until.elementLocated(By.tagName('body')), 10000);

    await sleep(2000);
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

async function testUrl({driver, params, checkUrl}) {
    const urlToCheck = checkUrl.generate(config.searchKey);
    logger.info('check reflections of:', urlToCheck);
    await setCookies({driver, params, urlToCheck});
    await driver.get(urlToCheck);
    await driver.wait(until.elementLocated(By.tagName('body')), 10000);
    await sleep(200);

    const reflectionResult = await driver.executeScript(searchForReflectionsCode);
    (reflectionResult.logs || []).forEach(logger.log);

    const payloads = generatePayloads(reflectionResult.reflections);
    logger.info('payloads generated:', payloads.length);

    return payloads.reduce(async (promise, payload) => {
        if (await promise && !params.allPayloads) {
            return true;
        }
        return testPayload({driver, params, checkUrl, payload});
    }, Promise.resolve(false));
}

async function main({params}) {
    if (params.help) {
        printHelp();
        return;
    }

    if (!params.urls.length) {
        logger.warn('no urls to check.');
        return;
    }

    let driver = null;
    await params.urls.reduce(async (preRawUrlsPromise, rawUrl) => {
        await preRawUrlsPromise;

        const checkUrls = generateUrlCombinations(rawUrl);
        if (!params.urls.length) {
            logger.warn('no combinations to test for:', rawUrl);
            return;
        }

        await checkUrls.reduce(async (preCheckUrlPromise, checkUrl) => {
            if (await preCheckUrlPromise && !params.allParams) {
                return true;
            }
            if (!driver) {
                driver = await new Builder().forBrowser('firefox').build();
            }
            try {
                return testUrl({driver, params, checkUrl})
            } catch (e) {
                logger.error('checking page error:', e);
                return false;
            }
        }, Promise.resolve(false));
    }, Promise.resolve());
    if (driver) {
        await driver.quit();
    }
}

module.exports = main;
