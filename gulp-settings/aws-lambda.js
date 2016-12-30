const gulp          = require('gulp');
const gutil         = require('gulp-util');
const del           = require('del');
const install       = require('gulp-install');
const archiver      = require('archiver');
const AWS           = require('aws-sdk');
const fs            = require('fs');
const path          = require('path');
const merge         = require('merge-stream');
const sequence      = require('gulp-sequence');
const changeCase    = require('change-case');
const minimist      = require('minimist');
const _             = require('lodash');
const chalk         = require('chalk');

const LAMBDA_RELATIVE_DIR = './aws/lambdas';
const LAMBDA_ABOSULTE_DIR = path.join(path.resolve(), LAMBDA_RELATIVE_DIR);
const lambdaFolders = getLambdaFoldersToBuild(minimist(process.argv.slice(2)));

function getLambdaFoldersToBuild({ src }) {
    if (!src) {
        return getDirectories(LAMBDA_RELATIVE_DIR);
    }

    return _.isArray(src) ? src : [src];
}

function getDirectories(sourcePath) {
    return fs.readdirSync(sourcePath).filter(file => {
        return fs.statSync(path.join(path.resolve(), sourcePath, file)).isDirectory();
    });
}

gulp.task('aws-lambda', sequence(
    'clean:lambda-builds',
    'npm-install',
    'lambda-builds',
    'upload'
));

gulp.task('clean:lambda-builds', () => {
    const zipFiles = lambdaFolders.map(lambda => {
        return path.join(LAMBDA_ABOSULTE_DIR, lambda, 'build.zip');
    });

    return del.sync(zipFiles);
});

gulp.task('npm-install', () => { 
    const gulpSources = lambdaFolders.map(lambda => {
        return gulp.src(path.join(LAMBDA_ABOSULTE_DIR, lambda , 'package.json'))
            .pipe(gulp.dest(`${LAMBDA_RELATIVE_DIR}/${lambda}`))
            .pipe(install({ production: true }));
    });

    return merge.apply(null, gulpSources);
});

gulp.task('lambda-builds', () => {
    const promises = lambdaFolders.map(lambda => {
        return new Promise((resolve, reject) => {
            const archive = archiver('zip');
            const output = fs.createWriteStream(path.join(LAMBDA_RELATIVE_DIR, lambda, 'build.zip'));

            output.on('close', resolve);
            archive.on('error', (err) => {
                gutil.log(err);
                reject();
            });

            archive.pipe(output);

            archive.file(path.join(LAMBDA_RELATIVE_DIR, lambda, 'index.js'), { name: 'index.js' });

            archive.directory(path.join(LAMBDA_RELATIVE_DIR, lambda, 'node_modules/'), 'node_modules');

            archive.finalize();
        });
    });

    return Promise.all(promises);
});

gulp.task('upload', () => {
    AWS.config.region = 'eu-central-1';

    return Promise.all(lambdaFolders.map(lambdaUploader));
});

const lambdaUploader = (lambdaFolder) => {
    const packageJSON = require(path.join(LAMBDA_ABOSULTE_DIR, lambdaFolder, 'package.json'));
    const lambdaFunctionName = changeCase.camelCase(packageJSON.name);
    const lambdaFunctionDescription = packageJSON.description;
    const awsLambda = new AWS.Lambda();

    return getLambdaFunction(awsLambda, lambdaFunctionName)
        .then(() => updateLambdaFunction(awsLambda, lambdaFolder, lambdaFunctionName))
        .catch(() => createLambdaFunction(awsLambda, lambdaFolder, lambdaFunctionName, lambdaFunctionDescription));
};

const getLambdaFunction = (awsLambda, lambdaFunctionName) => {
    gutil.log(`Checking if lambda function: ${lambdaFunctionName} exists`);

    return new Promise((resolve, reject) => {
        awsLambda.getFunction({ FunctionName: lambdaFunctionName }, (err) => {
            if (err) {
                if (err.statusCode === 404) {
                    gutil.log(`Unable to find lambda function: ${lambdaFunctionName}, creating it now...`);
                } else {
                    gutil.log('AWS API request failed. Check your AWS credentials and permission');
                }

                reject(err);
            }

            resolve('Success');
        });
    });
};

const updateLambdaFunction = (awsLambda, lambdaFolder, lambdaFunctionName) => {
    gutil.log(`Updating lambda function: ${lambdaFunctionName}...`);

    return new Promise((resolve, reject) => {
        readLambdaBuild(lambdaFolder, lambdaFunctionName)
            .then((fileData) => {
                awsLambda.updateFunctionCode({
                    FunctionName: lambdaFunctionName,
                    ZipFile: fileData
                }, (err) => {
                    if (err) {
                        gutil.log(err);
                        gutil.log('Package upload failed. Check your iam:PassRole permission');

                        reject(err);
                    }

                    gutil.log(`Successfully updated: ${chalk.green(lambdaFunctionName)}`);

                    resolve('success');
                });
            });
    });
};

const createLambdaFunction = (awsLambda, lambdaFolder, lambdaFunctionName, lambdaFunctionDescription) => {
    gutil.log(`Creating lambda function: ${lambdaFunctionName}...`);

    return new Promise((resolve, reject) => {
        readLambdaBuild(lambdaFolder, lambdaFunctionName)
            .then((fileData) => {
                awsLambda.createFunction({
                    Code: { ZipFile: fileData },
                    FunctionName: lambdaFunctionName,
                    Handler: 'index.handler',
                    Role: 'arn:aws:iam::136323943602:role/service-role/developer',
                    Runtime: 'nodejs4.3',
                    Description: lambdaFunctionDescription
                }, (err) => {
                    if (err) {
                        gutil.log(err);
                        gutil.log('Package upload failed. Check your iam:PassRole permission');

                        reject(err);
                    }

                    gutil.log(`Successfully created: ${chalk.green(lambdaFunctionName)}`);

                    resolve('success');
                });
            });
    });
};

const readLambdaBuild = (lambdaFolder, lambdaFunctionName) => {
    gutil.log(`Reading build for lambda function: ${lambdaFunctionName}...`);

    return new Promise((resolve, reject) => {
        fs.readFile(path.join(LAMBDA_ABOSULTE_DIR, lambdaFolder, 'build.zip'), (err, fileData) => {
            if (err) {
                gutil.log(`Cannot read build file for lambda: ${lambdaFunctionName}, in folder: ${lambdaFolder}`);
                gutil.log(err);

                reject(err);
            }

            resolve(fileData);
        });
    });
};
