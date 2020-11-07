var AxeBuilder = require('axe-webdriverjs');
var WebDriver = require('selenium-webdriver');


var driver = new WebDriver.Builder()
    .forBrowser('chrome')
    .build();

// http://localhost:3000/ -> Ann Factory code running in local

driver
    .get('http://localhost:3000/')
    .then(function () {
        AxeBuilder(driver)
            .analyze(function (results) {

                if (results) {

                    console.log(results);
                    //throw new Error('An error occurred');
                }
            });
    });

