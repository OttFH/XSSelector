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

TODO: Add usage
