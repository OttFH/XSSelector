# XSSelector

This is xss detection tool with selenium. It is currently in a prototype stage.

## Getting Started

### Requirements

- [Node.js](https://nodejs.org/)
  - tested with v14.16.0
- Firefox
  - tested with Version 88.0.1
- [geckodriver](https://github.com/mozilla/geckodriver/releases)

````
git https://github.com/OttFH/XSSelector.git
cd XSSelector
npm install
````


## Usage
Please note that not all features are implemented yet.
````
D:\XSSelector> node ./index.js -h

Usage: node ./index.js [options]
DO NOT USE npm run, because start args do not work in then!!!!!

Options:
  -h, --help               just shows this help message.
  -u, --urls               list of urls to check.
                           type: string
  --urls-file              path of a text files with urls to check.
                           type: string
  --code                   path of files with code to execute. Check out README for more information.
                           type: string, default: string
  --all-params             check all parameters of an url even if a vulnerable parameter is found. (Not used yet)
                           type: boolean, default: false
  --all-payloads           try all generated payloads an url even if a vulnerable payload is found.
                           type: boolean, default: false
  -X, --method             change the HTTP method for the requests. options: get, post, put, delete.
                           type: string, default: GET
  --body                   the body that is used as request body. FORMAT
                           type: string
  -h, --header             a header to send. Use multiple times for multiple headers. Format: --header "name" "value"
                           type: string, default: string
  -c, --cookie             a cookie to use. Use multiple times for multiple cookies. Format: --cookie "name=value"
                           type: string, default: string
  --use-browser-cookie     always sets cookies within the browser. Otherwise may set cookie only via internal proxy.
                           type: boolean, default: false
  --params                 search for query- and body parameters in DOM.
                           type: boolean, default: false
  --crawl                  search for more URLs to check.
                           type: boolean, default: false
  --crawl-depth            maximum depth to crawl.
                           type: number, default: 8
  --show-browser           show browser window.
                           type: boolean, default: false
  --detection-timeout      how long to wait in milliseconds for xss to occur.
                           type: number, default: 200
  --internal-proxy-port    changes the port of the internal proxy. This proxy is used to modify requests.
                           type: number, default: 7132
  --log-level              sets log level. options: debug, info, warn, error, vuln.
                           type: string, default: warn
````

### Examples

#### Test a URLs  
`node ./index.js -u https://xss-suite-test-site.herokuapp.com/pages/simple_tag.php?xss=234 https://xss-suite-test-site.herokuapp.com/pages/simple_value.php?xss=234`

#### Test URLs from file
One line for each URL. Empty lines get ignored.  
`node ./index.js --urls-file ./urls`  

#### Test POST URL
`node ./index.js -X POST --body "xss=123" -u https://xss-suite-test-site.herokuapp.com/pages/post_simple_tag.php`

#### Analyze DOM to find query and body parameter
`node ./index.js --params -u https://xss-suite-test-site.herokuapp.com/pages/post_simple_tag.php`

#### Crawl mode. Analyze DOM to find more URLs
`node ./index.js --crawl -u https://xss-suite-test-site.herokuapp.com`


## Code Mode

Define the steps to run in a JavaScript file (e.g. `steps.js`) as any array of functions.
Export this array within the file and start XSSelector as follows:  
`node ./indexjs --code steps.js`

### What a step looks like

A step is a (async) functions that returns an object with a type, and some additional data depending on the type.
The result of every step gets pushed to an array and can be accessed by all steps.

#### Function parameter

- **driver**: WebDriver  
  The WebDriver object from the selenium driver. Check out the selenium
  [documentation](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html)
  to learn more about what you can do with it.
- **payload**: string  
  The payload string to inject into the website.
- **index**: integer  
  The index of the current step.
- **results**: array  
  The array of results of the previous steps.
  If a step threw an exception then the result of the step would be the error object. 
- **previousResult**: any  
  The result or exception object of the previous step.

#### Types
- **BROWSER_REQUEST**:  
  - Performs a browser request.
  - Additional properties:
    - **url**: string (**required**)  
      The URL the browser will call
    - **method**: string  
      The HTTP method that will be used. Options: GET (default), POST, PUT, DELETE
    - **body**: string  
      Request body data for POST, PUT, DELETE requests
    - **headers**: object  
      The headers to set in the request. Overrides the headers that are defined on startup. 
    - **cookies**: array ({name: string, value: string}[])  
      The cookies to set in the request. Overrides the cookies that are defined on startup. 
    - **useBrowserCookies**: boolean  
      Set the cookies within the browser and don't just send them in the request header. 
  - Result: `null`
  - Example:
```
({payload}) => {
  return {
    type: 'BROWSER_REQUEST',
    url: 'https://xss-suite-test-site.herokuapp.com/pages/post_data.php',
    method: 'POST',
    body: `xss=${encodeURIComponent(payload)}`,
  };
}
```

- **BROWSER_SCRIPT**
  - Execute a script within the browser.
  - Additional properties:
    - **script**: string (**required**)  
      JavaScript code to run within the browser.
  - Result: return value of the script.
  - Example:
```
() => {
  return {
    type: 'AXIOS_REQUEST',
    config: 'document.querySelector("#root > div.container > div.value-container > button").click()',
  };
}
```

- **AXIOS_REQUEST**
  - Perform an axios request.
  - Additional properties:
    - **config**: object (**required**)  
      The configuration that is used to perform an axios request with the axios API.
      Check out the axios [documentation](https://github.com/axios/axios#axios-api) for more details.
  - Result: return value of the axios call.
  - Example:
```
({payload}) => {
  return {
    type: 'AXIOS_REQUEST',
    config: {
      method: 'post',
      url: 'https://xss-suite-test-site.herokuapp.com/pages/post_private_data.php',
      data: `xss=${encodeURIComponent(payload)}`,
    },
  };
}
```

- **RESULT**
  - Use this type to implement some custom logic that can not be done with the previous types.
    Return a result of this logic to use it in the next step.
  - Additional properties:
    - **result**: any  
      The result that the following steps can use.
  - Result: the value of the result property.
  - Example:
```
async ({driver}) => {
  await driver.wait(until.alertIsPresent(), 5000); // wait 5 seconds for an alert dialog to show up.
  return {
    type: 'RESULT',
    // return true if an alert shows up.
    // (driver.wait() throws an exception if it does not happen, which will be catched by XSSelector)
    result: true,
  };
}
```


### Examples

```
const {httpMethods, codeModeStepTypes} = require('./src/constents');

module.exports = [
    ({payload}) => ({
        type: codeModeStepTypes.BROWSER_REQUEST,
        url: 'https://xss-suite-test-site.herokuapp.com/pages/post_data.php',
        method: httpMethods.POST,
        body: `xss=${encodeURIComponent(payload)}`,
    }),
    () => ({
        type: codeModeStepTypes.BROWSER_REQUEST,
        url: 'https://xss-suite-test-site.herokuapp.com/pages/post_read_data.php',
    }),
];
```

```
const {httpMethods, codeModeStepTypes} = require('./src/constents');

module.exports = [
    ({payload}) => ({
        type: codeModeStepTypes.AXIOS_REQUEST,
        config: {
            method: 'post',
            url: 'https://xss-suite-test-site.herokuapp.com/pages/post_private_data.php',
            data: `xss=${encodeURIComponent(payload)}`,
        },
    }),
    ({previousResult: {data}}) => ({
        type: codeModeStepTypes.BROWSER_REQUEST,
        url: `https://xss-suite-test-site.herokuapp.com/pages/read_private_data.php?id=${data && data.id}`,
    }),
];
```

```
const {httpMethods, codeModeStepTypes} = require('./src/constents');

module.exports = [
    () => ({
        type: codeModeStepTypes.BROWSER_REQUEST,
        url: 'https://react-xss-suite-test-site.herokuapp.com/postData',
    }),
    ({payload}) => ({
        type: codeModeStepTypes.BROWSER_SCRIPT,
        script: `document.querySelector("#root > div.container > div.value-container > label > input").value=${JSON.stringify(payload)}`,
    }),
    () => ({
        type: codeModeStepTypes.BROWSER_SCRIPT,
        script: 'document.querySelector("#root > div.container > div.value-container > button").click()',
    }),
    () => ({
        type: codeModeStepTypes.BROWSER_REQUEST,
        url: 'https://react-xss-suite-test-site.herokuapp.com/readData',
    }),
];
```
