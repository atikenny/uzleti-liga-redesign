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
const lambdaFolders = getDirectories(LAMBDA_RELATIVE_DIR);

const { src: commandLineLambdas = 'all' } = minimist(process.argv.slice(2));

function getDirectories(sourcePath) {
    return fs.readdirSync(sourcePath).filter(file => {
        return fs.statSync(path.join(path.resolve(), sourcePath, file)).isDirectory();
    });
}

gulp.task('aws-lambda', sequence(
    'clean:lambda-builds',
    'npm-dependencies',
    'lambda-builds',
    'upload'
));

gulp.task('clean:lambda-builds', () => {
    const zipFiles = lambdaFolders.map(lambda => {
        return path.join(LAMBDA_ABOSULTE_DIR, lambda, 'build.zip');
    });

    return del.sync(zipFiles);
});

gulp.task('npm-dependencies', () => { 
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

const lambdaUploader = (lambdaFolder) => {
    const awsLambda = new AWS.Lambda();
    const lambda = changeCase.camelCase(require(path.join(LAMBDA_ABOSULTE_DIR, lambdaFolder, 'package.json')).name);

    return new Promise((resolve, reject) => {
        awsLambda.getFunction({ FunctionName: lambda }, (err, data) => {
            if (err) {
                if (err.statusCode === 404) {
                    gutil.log(`Unable to find lambda function: ${lambda}`);
                    gutil.log('Verify the lambda function name and AWS region are correct');
                } else {
                    gutil.log('AWS API request failed. Check your AWS credentials and permission');
                }
                reject(err);
            } else {
                fs.readFile(path.join(LAMBDA_ABOSULTE_DIR, lambdaFolder, 'build.zip'), (err, data) => {
                    const params = {
                        FunctionName: lambda,
                        ZipFile: data
                    };
                    awsLambda.updateFunctionCode(params, (err, data) => {
                        if (err) {
                            gutil.log(err);
                            gutil.log('Package upload failed. Check your iam:PassRole permission');
                            reject(err);
                        }
                        gutil.log(`Successfully uploaded: ${chalk.green(lambda)}`);
                        resolve('success');
                    });
                });
            }
        });
    });
};

gulp.task('upload', () => {
    return new Promise((resolve, reject) => {

        AWS.config.region = 'eu-central-1';

        if (commandLineLambdas === 'all') {
            return Promise.all(lambdaFolders.map(lambdaUploader))
                .then(resolve)
                .catch(reject);
        } else {
            if (_.isArray(commandLineLambdas)) {
                return Promise.all(commandLineLambdas.map(lambdaUploader))
                    .then(resolve)
                    .catch(reject);
            } else {
                return lambdaUploader(commandLineLambdas)
                    .then(resolve)
                    .catch(reject);
            }
        }
    });
});
