'use strict';
 
const gulp  = require('gulp');
const sass  = require('gulp-sass');
const gulpReact  = require('gulp-react');

gulp.task('default', ['build'], function () {
    gulp.start('build:watch');
});

gulp.task('sass', function () {
    return gulp.src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('transpile-js', function() {
    return gulp.src('./js/**/*.jsx')
        .pipe(gulpReact({ harmony: true }))
        .pipe(gulp.dest('./js'))
});
 
gulp.task('build', ['sass', 'transpile-js'], function () {
    gulp.src('./css/**/*.css')
        .pipe(gulp.dest('./build/css'));

    gulp.src('./font/**/*.*')
        .pipe(gulp.dest('./build/font'));

    gulp.src('./manifest.json')
        .pipe(gulp.dest('./build'));

    gulp.src('./img/**/*.*')
        .pipe(gulp.dest('./build/img'));

    gulp.src('./js/**/*.js')
        .pipe(gulp.dest('./build/js'));
});

gulp.task('build:watch', function () {
    const filePatterns = [
        'css/**/*.css',
        'font/**/*.*',
        'manifest.json',
        'img/**/*.*',
        'js/**/*.*'
    ];

    gulp.watch('./sass/**/*.scss', ['sass']);
    gulp.watch(filePatterns, ['build']);
});
