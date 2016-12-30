const spawn         = require('child_process').spawn;
const webdriver     = require('selenium-webdriver');
const _             = require('lodash/fp');

const os = process.platform  === 'win32' ? 'win' : process.platform;

const fileToDebug = process.argv.splice(2)[0];
const nodeNightlyArguments = ['--inspect', '--debug-brk', fileToDebug];

if(os === 'win') {
    const command = spawn('./node_modules/node-nightly/node-nightly/node', nodeNightlyArguments);
    openBrowser(command);
} else {
    const command = spawn('./node_modules/node-nightly/node-nightly/bin/node', nodeNightlyArguments);
    openBrowser(command);
}

function openBrowser(command) {
    const driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build();

    getDevToolsUrl(command).then(devToolsUrl => {
        driver.get(devToolsUrl);
        // This is required so the browser won't exit
        driver.wait(new Promise((resolve, reject) => {}));
    });
}

function getDevToolsUrl(command) {
    return new Promise((resolve, reject) => {
        command.stderr.on('data', data => {
            const devToolsUrl = _.find(_.includes('chrome-devtools'), data.toString().split('\r\n')).trim();
            resolve(devToolsUrl);
        });
    });
}

