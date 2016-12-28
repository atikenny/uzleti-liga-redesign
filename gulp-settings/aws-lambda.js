const gulp          = require('gulp');
const gutil         = require('gulp-util');
const del           = require('del');
const install       = require('gulp-install');
const zip           = require('gulp-zip');
const AWS           = require('aws-sdk');
const fs            = require('fs');
const path          = require('path');
const merge         = require('merge-stream');
const sequence      = require('gulp-sequence');
const changeCase    = require('change-case');

const LAMBDA_RELATIVE_DIR = './aws/lambdas';
const LAMBDA_ABOSULTE_DIR = path.join(path.resolve(), LAMBDA_RELATIVE_DIR);
const lambdas = getDirectories(LAMBDA_RELATIVE_DIR);


function getDirectories(sourcePath) {
    return fs.readdirSync(sourcePath).filter(file => {
        return fs.statSync(path.join(path.resolve(), sourcePath, file)).isDirectory();
    });
}

gulp.task('aws-lambda', sequence(
    'clean:lambda:zip',
    'npm-dependencies',
    'zip',
    'upload'
));

gulp.task('clean:lambda:zip', () => {
    const zipFiles = lambdas.map(lambda => {
        return path.join(LAMBDA_ABOSULTE_DIR, lambda, 'build.zip');
    });

    return del.sync(zipFiles);
});

gulp.task('npm-dependencies', () => { 
    const gulpSources = lambdas.map(lambda => {
        const source = [
            path.join(LAMBDA_ABOSULTE_DIR, lambda, '**/*'),
            `!${path.join(LAMBDA_ABOSULTE_DIR, lambda, 'package.json')}`,
            path.join(LAMBDA_ABOSULTE_DIR, lambda, '/.*')
        ];
        return gulp.src(path.join(LAMBDA_ABOSULTE_DIR, `${lambda}/package.json`))
            .pipe(gulp.dest(`${LAMBDA_RELATIVE_DIR}/${lambda}`))
            .pipe(install({ production: true }));
    });

    return merge.apply(null, gulpSources);
});

gulp.task('zip', () => {
    const gulpSources = lambdas.map(lambda => {
        const source = [
            path.join(LAMBDA_ABOSULTE_DIR, lambda, '**/*'),
            `!${path.join(LAMBDA_ABOSULTE_DIR, lambda, 'package.json')}`,
            path.join(LAMBDA_ABOSULTE_DIR, lambda, '/.*')
        ];

        return gulp.src(source)
            .pipe(zip('build.zip'))
            .pipe(gulp.dest(`${LAMBDA_RELATIVE_DIR}/${lambda}`));
    
    });

    return merge.apply(null, gulpSources);
});

gulp.task('upload', () => {
    return new Promise((resolve, reject) => {

        AWS.config.region = 'eu-central-1';

        let promises = [];

        lambdas.forEach(lambdaFolder => {
            const awsLambda = new AWS.Lambda();
            const lambda = changeCase.camelCase(require(`${path.join(LAMBDA_ABOSULTE_DIR, lambdaFolder, 'package.json')}`).name);

            promises.push(new Promise((resolve, reject) => {
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
                        fs.readFile(path.join(LAMBDA_ABOSULTE_DIR, lambda, 'build.zip'), (err, data) => {
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
                                resolve('success');
                            });
                        });
                    }
                });
            }));
        });

        return Promise.all(promises)
            .then(resolve);
    });
});
