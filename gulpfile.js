const gulp          = require('gulp');
const sass          = require('gulp-sass');
const react         = require('gulp-react');
const sourcemaps    = require('gulp-sourcemaps');
const concat        = require('gulp-concat');
const exec          = require('child_process').exec;

gulp.task('default', ['build'], () => {
    gulp.start('build:watch');
    gulp.start('server');
});

gulp.task('build:watch', () => {
    const filePatterns = [
        'app/css/**/*.css',
        'app/font/**/*.*',
        'app/img/**/*.*',
        'app/js/**/*.*',
        'app/**/*.html'
    ];

    gulp.watch('app/sass/**/*.scss', ['sass']);
    gulp.watch(filePatterns, ['build']);
});
 
gulp.task('build', ['html', 'sass', 'jsx'], () => {
    gulp.src('./app/css/**/*.css')
        .pipe(gulp.dest('./build/css'));

    gulp.src('./app/font/**/*.*')
        .pipe(gulp.dest('./build/font'));

    gulp.src('./app/img/**/*.*')
        .pipe(gulp.dest('./build/img'));
});

gulp.task('sass', () => {
    return gulp.src('app/sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(concat('main.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/css'));
});

gulp.task('jsx', () => {
    return gulp.src('app/js/**/*.jsx')
        .pipe(sourcemaps.init())
        .pipe(react({ harmony: true }))
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/js'))
});

gulp.task('html', () => {
    return gulp.src('app/**/*.html')
        .pipe(gulp.dest('./build/'));
});

gulp.task('server', () => {
    exec('node index.js', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        callback(err);
    });
});
