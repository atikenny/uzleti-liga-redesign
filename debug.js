const spawn         = require('child_process').spawn;
const fs            = require('fs');
const webdriver     = require('selenium-webdriver');
const _             = require('lodash/fp');

const NODE_NIGHTLY_CONFIG = {
    os: process.platform  === 'win32' ? 'win' : process.platform,
    path: process.platform  === 'win32' ? './node_modules/node-nightly/node-nightly/node' : './node_modules/node-nightly/node-nightly/bin/node',
    line_ending: require('os').EOL
};

const fileToDebug = process.argv.splice(2)[0];

if (!fs.existsSync(fileToDebug)) {
    console.error('Error!');
    console.error(`File: ${fileToDebug} does not exist`);
    return;
}

const nodeNightlyArguments = ['--inspect', '--debug-brk', fileToDebug];
const command = spawn(NODE_NIGHTLY_CONFIG.path, nodeNightlyArguments);

openBrowser(command);

function openBrowser(command) {
    const driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build();

    getDevToolsUrl(command).then(devToolsUrl => {
        driver.get(devToolsUrl);
        // This is required so the browser won't exit
        driver.wait(new Promise(_.noop));
    });
}

function getDevToolsUrl(command) {
    const getUrlFromStdErr = (resolve, data) => {
        const devToolsUrl = _.flow(
                _.find(_.includes('chrome-devtools')),
                _.trim
            )(data.toString().split(NODE_NIGHTLY_CONFIG.line_ending))

        // unsubscribe from the stream
        command.stderr.removeListener('data', getUrlFromStdErr);

        resolve(devToolsUrl);
    };


    return new Promise((resolve, reject) => {
        command.stderr.on('data', _.curry(getUrlFromStdErr)(resolve));
    });
}

