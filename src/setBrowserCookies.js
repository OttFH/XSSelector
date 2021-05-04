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

module.exports = setCookies;
