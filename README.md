# download-page-regression-test

This tool allows you check some performance values of your page.
It uses [puppeteer](https://github.com/GoogleChrome/puppeteer) to opening the page and getting performance values from it.

## Run

To run with config (see below):

```bash
download-page-regression-test --config path/to/config/file.json
```

or to run with default checkers' parameters:

```bash
download-page-regression-test https://github.com https://google.com
```

## Config

Config file allows you specify URLs which should be check, override some values for checkers or disable some rules at all.

Config must have the following structure:

```javascript
{
  "URL": {
    "rules": {
      "RULE-NAME": { // optional
        "value": NEW_VALUE_FOR_RULE, // to override checker's default parameter
        "enabled": false, // to disable checker for this page - by default all checkers are enabled
      }
    }
  },
}
```

Example of simple config:

```json
{
  "https://github.com": {
    "rules": {
      "requests-count": {
        "value": 100
      }
    }
  },
  "https://www.google.com": {
    "rules": {
      "requests-count": {
        "enabled": false
      }
    }
  },
  "https://translate.google.com": {}
}
```

## Rules

### dom-content-loaded-time

*Default*: `3000`

Checks when `DOMCOntentLoaded` event is fired (time in milliseconds).

### load-time

*Default*: `5000`

Checks when `load` event is fired (time in milliseconds).

### no-redirects

Checks if after opening URL page is redirected to another page.

### requests-count

*Default*: `30`

Count of requests which browser made until `load` event is fired.

### entry-html-file-size

*Default*: `14336` (14KB)

Checks the size of opened page (transferred size) (size in bytes).


### total-loaded-size

*Default*: `1048576` (1MB)

Checks the size of all made requests until `load` event is fired (transferred size) (size in bytes).
