const config = require('./config');
const {Builder, By, until} = require('selenium-webdriver');
const params = require('./args/parameters');
const {sleep} = require("./utils");
const {loadCommandLineArgs} = require('./args/handleParameters');
const logger = require('./logging/logger');
const getSearchReflectionCode = require('./browser/getSearchReflectionCode');
const generatePayloads = require("./generatePayloads");
const generateUrlCombinations = require("./generateUrlCombinations");

const searchForReflectionsCode = getSearchReflectionCode(config.searchKey);

async function main() {
    await loadCommandLineArgs();

    if (params.help) {
        // TODO: print out manual
        console.log('help');
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
                console.log('main0:', checkUrl.generate(config.searchKey));
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
                    console.log('main3:', checkUrl.generate(payload.payload));
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

main()
    .then(() => process.exit(0))
    .catch(e => {
        logger.error('unhandled exception:', e);
        process.exit(1);
    });
