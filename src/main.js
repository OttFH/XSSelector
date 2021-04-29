const config = require('./config');
const {Builder, By, until} = require('selenium-webdriver');
const {sleep} = require("./utils");
const {logger} = require('./logging/logger');
const getSearchReflectionCode = require('./browser/getSearchReflectionCode');
const generatePayloads = require('./payloads/generatePayloads');
const generateUrlCombinations = require('./generateUrlCombinations');
const printHelp = require('./utils/printHelp');

const searchForReflectionsCode = getSearchReflectionCode(config.searchKey);

// TODO: add cookies and other HTTP-Headers
// TODO: add other HTTP methods
// TODO: add code mode
// TODO: add Parameter selection
// TODO: add more payloads
// TODO: add crawl mode
// TODO: update README
// TODO: fix starting with npm

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
                await driver.get(checkUrl.generate(config.searchKey));
                await driver.wait(until.elementLocated(By.tagName('body')), 10000)
                await sleep(1000);

                const reflectionResult = await driver.executeScript(searchForReflectionsCode);
                (reflectionResult.logs || []).forEach(logger.log);

                const payloads = generatePayloads(reflectionResult.reflections);
                return await payloads.reduce(async (promise, payload) => {
                    if (await promise && !params.allPayloads) {
                        return true;
                    }
                    await driver.get(checkUrl.generate(payload.payload));
                    await driver.wait(until.elementLocated(By.tagName('body')), 10000);

                    await sleep(1000);
                    if (payload.trigger) {
                        const triggerResult = await driver.executeScript(payload.trigger);
                        logger.info('trigger result:', triggerResult);
                    }

                    const assertResult = await driver.executeScript(payload.assert);
                    if (assertResult) {
                        logger.vuln('result:', assertResult, 'payload:', payload.payload);
                    } else {
                        logger.info('assertion was falsy');
                    }
                    return !!assertResult;
                }, Promise.resolve());
            } catch (e) {
                logger.error('checking page error:', e);
                return false;
            }
        }, Promise.resolve());
    }, Promise.resolve());
    if (driver) {
        await driver.quit();
    }
}

module.exports = main;