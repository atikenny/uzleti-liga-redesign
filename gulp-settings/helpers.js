'use strict';
const gutil         = require('gulp-util');
const chalk         = require('chalk');
const prettyTime    = require('pretty-hrtime');
const path          = require('path');
const spawn         = require('child_process').spawn;


module.exports = function (parentModule) {
    const DIRNAME = path.dirname(parentModule.id);

    return {
        handleError: handleError,
        clock: clock,
        runSingleTest: runSingleTest
    };

    function handleError(err) {
        gutil.log(err.toString());
        this.emit('end');
    }

    function clock(start) {
        if (!start) {
            return process.hrtime();
        }
        
        return process.hrtime(start);
    }

    function runSingleTest(event) {
        const { path: file } = event;
        const relativeFilePath = file.replace(DIRNAME + '\\', '');

        gutil.log(`Test file changed: ${chalk.green(relativeFilePath)}`);
        gutil.log(`Starting '${chalk.cyan('single test')}'...`);

        const start = clock();
        const jest = spawn('node', ['./node_modules/jest/bin/jest.js', file, '-i'], { stdio: 'inherit' });

        jest.on('close', () => {
            const duration = prettyTime(clock(start));
            gutil.log(`Finished '${chalk.cyan('single test')}' after ${chalk.magenta(duration)}`);
        });
    }
}


