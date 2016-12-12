const gulp          = require('gulp');
const sass          = require('gulp-sass');
const source        = require('vinyl-source-stream');
const buffer        = require('vinyl-buffer');
const sourcemaps    = require('gulp-sourcemaps');
const browserify    = require('browserify');
const browserSync   = require('browser-sync').create();
const del           = require('del');
const rev           = require('gulp-rev');
const revReplace    = require('gulp-rev-replace');
const gutil         = require('gulp-util');
const uglify        = require('gulp-uglify');
const merge         = require('merge-stream');
const sequence      = require('gulp-sequence');
const filter        = require('gulp-filter');
const minifycss     = require('gulp-clean-css');
const _             = require('lodash');

const PATHS = {
    appEntry: 'app/js/main/main-app.jsx',
    distFolder: 'build',
    tempFolder: 'temp',
    https: {
        cert: 'app/cert/localhost.crt',
        key: 'app/cert/localhost.key'
    },
    extensions: ['.js', '.json', '.jsx']
};

const THIRD_PARTY = _.keys(require('./package.json').dependencies);

const ENVIRONMENT = {
    isDev: process.env.NODE_ENV.trim() === 'dev',
    isProd: process.env.NODE_ENV.trim() === 'prod'
};

gulp.task('default', sequence(
    'clean',
    ['build:app', 'build:vendor', 'copy-resource', 'html', 'sass'],
    'revision',
    'rev-replace',
    'build:watch',
    'server'
));

gulp.task('build', sequence(
    'clean',
    ['build:app', 'build:vendor', 'copy-resource', 'html', 'sass'],
    'revision',
    'rev-replace'
));

gulp.task('build:app', () => {
    let appBundler = browserify({
        entries: PATHS.appEntry,
        debug: ENVIRONMENT.isDev,
        extensions: PATHS.extensions
    });

    THIRD_PARTY.forEach(lib => {
        appBundler.external(lib);
    });

    appBundler = appBundler
        .transform('babelify', { presets: ['es2015', 'react'], sourceMap: true, sourceMapRelative: process.cwd()})
        .bundle()
        .on('error', handleError)
        .pipe(source('app-bundle.js'));

    if (ENVIRONMENT.isDev) {
        appBundler = appBundler
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'));
    } else {
        appBundler = appBundler
            .pipe(buffer())
            .pipe(uglify());
    }

    return appBundler.pipe(gulp.dest(`${PATHS.tempFolder}`));
});

gulp.task('build:vendor', () => {
    let vendorBundle = browserify({
        require: THIRD_PARTY,
        debug: ENVIRONMENT.isDev
    })
        .bundle()
        .on('error', handleError)
        .pipe(source('vendor-bundle.js'));

    if (ENVIRONMENT.isProd) {
        vendorBundle = vendorBundle
            .pipe(buffer())
            .pipe(uglify());
    }

    return vendorBundle.pipe(gulp.dest(`${PATHS.tempFolder}`));
});

gulp.task('server', (done) => {
    browserSync.init({
        server: {
            baseDir: PATHS.distFolder
        },
        https: PATHS.https
    });

    done();
});

gulp.task('copy-resource', () => {
    let fonts = gulp.src('./app/font/**/*.*')
        .pipe(gulp.dest(`${PATHS.distFolder}/font`));

    let images = gulp.src('./app/img/**/*.*')
        .pipe(gulp.dest(`${PATHS.distFolder}/img`));

    return merge(fonts, images);
});

gulp.task('clean', () => {
    return del.sync([PATHS.distFolder, PATHS.tempFolder]);
});

gulp.task('clean:js', () => {
    return del.sync([`${PATHS.distFolder}/**/*.js*`, '!vendor*']);
});

gulp.task('clean:css', () => {
    return del.sync([`${PATHS.distFolder}/**/*.css*`]);
});

gulp.task('build:watch', () => {
    gulp.watch('app/sass/**/*.scss', () => {
        sequence('clean:css', 'sass')();
    });
    gulp.watch('app/js/**/*.jsx', () => {
        sequence('clean:js', 'build:app')();
    });
    gulp.watch('app/**/*.html', () => {
        sequence('html', 'rev-replace')();
    });
    gulp.watch(`${PATHS.tempFolder}/**/*.*`, () => {
        sequence('html', 'rev-replace')();
    });
    gulp.watch(`${PATHS.distFolder}/**/*.*`, _.debounce(browserSync.reload, 100));
});

gulp.task('revision', () => {
    let filterServiceWorker = filter([
        `${PATHS.tempFolder}/**/*.*`,
        `!${PATHS.tempFolder}/service-worker.js`
    ], { restore: true });

    return gulp.src(`${PATHS.tempFolder}/**/*.*`)
        .pipe(filterServiceWorker)
        .pipe(rev())
        .pipe(gulp.dest(PATHS.distFolder))
        .pipe(rev.manifest())
        .pipe(filterServiceWorker.restore)
        .pipe(gulp.dest(PATHS.distFolder));
});

gulp.task('rev-replace', ['revision'], () => {
    let manifestFile = require(`./${PATHS.distFolder}/rev-manifest.json`),
        manifest = gulp.src(`${PATHS.distFolder}/rev-manifest.json`),
        replaceTargets = [
            `${PATHS.distFolder}/index.html`,
            `${PATHS.distFolder}/${manifestFile['business-league.css']}`,
            `${PATHS.tempFolder}/service-worker.js`];

    return gulp.src(replaceTargets)
        .pipe(revReplace({ manifest: manifest }))
        .pipe(gulp.dest(PATHS.distFolder));
});

gulp.task('sass', () => {
    let sassBundle = gulp.src('app/sass/**/*.scss');

    if (ENVIRONMENT.isDev) {
        sassBundle = sassBundle
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemaps.write('.'));
    } else {
        sassBundle = sassBundle.pipe(sass().on('error', sass.logError))
            .pipe(minifycss());
    }

    return sassBundle.pipe(gulp.dest(`${PATHS.tempFolder}`));
});

gulp.task('html', () => {
    return gulp.src('app/**/*.html')
        .pipe(gulp.dest(`${PATHS.distFolder}`));
});

function handleError(err) {
    gutil.log(err.toString());
    this.emit('end');
}
