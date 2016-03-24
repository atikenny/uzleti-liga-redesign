'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('default', function () {
    gulp.start('build:watch');
});

gulp.task('sass', function () {
    return gulp.src('./sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});
 
gulp.task('build', ['sass'], function () {
    gulp.src('./css/**/*.css')
        .pipe(gulp.dest('./build/css'));

    gulp.src('./manifest.json')
        .pipe(gulp.dest('./build'));

    gulp.src('./img/**/*.*')
        .pipe(gulp.dest('./build/img'));

    gulp.src('./js/**/*.*')
        .pipe(gulp.dest('./build/js'));
});

gulp.task('build:watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
    gulp.watch('./css/**/*.css', ['build']);
    gulp.watch('./manifest.json', ['build']);
    gulp.watch('./img/**/*.*', ['build']);
    gulp.watch('./js/**/*.*', ['build']);
});