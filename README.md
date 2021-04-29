# XSSelector

This is xss detection tool with selenium. It is currently in a prototype stage.

## Usage
Please note that not all features are implemented yet.
````
D:\XSSelector> node ./index.js -h

Usage: node ./index.js [options]
DO NOT USE npm run, because start args do not work in then!!!!!

Options:
  -h, -help        just shows this help message.
  -u, -urls        list of urls to check.
                   type: string
  -urls-file       path of a text files with urls to check.
                   type: string
  -code            path of a files with code to execute. Check out README for more information.
                   type: string, default: string
  -all-params      check all parameters of an url even if a vulnerable parameter is found. (Not used yet)
                   type: boolean
  -all-payloads    try all generated payloads an url even if a vulnerable payload is found.
                   type: boolean
  -c, -cookies     cookies to use. (not implemented yet)
                   type: string, default: string
  -params          search for parameters. (not implemented yet)
                   type: boolean
  -crawl           search for more urls to check. (not implemented yet)
                   type: boolean
  -crawl-depth     maximum depth to crawl. (not implemented yet)
                   type: number, default: 8
  -gen-key         generate a search key and not use the one from config. (not implemented yet)
                   type: boolean
  -show-browser    show browser window. (not implemented yet)
                   type: boolean
  -retries         how often to wait for xss to occur. (not implemented yet)
                   type: number, default: 3
  -retry-delay     how long to wait between tries for xss to occur. (not implemented yet)
                   type: number, default: 500
  -log-level       sets log level. options: debug, info, warn, error, vuln.
                   type: string, default: warn

````

## Code Mode

Not implemented yet.
