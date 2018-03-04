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
    "RULE-NAME": { // optional
      "value": NEW_VALUE_FOR_RULE, // to override checker's default parameter
      "enabled": false, // to disable checker for this page - by default all checkers are enabled
    }
  },
}
```

Example of simple config:

```json
{
  "https://github.com": {
    "requests-count": {
      "value": 100
    }
  },
  "https://www.google.com": {
    "requests-count": {
      "enabled": false
    }
  },
  "https://translate.google.com": {}
}
```
