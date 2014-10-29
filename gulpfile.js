var gulp = require('gulp')
  , mocha = require('gulp-mocha')
  , uglify = require('gulp-uglify')
  , rename = require('gulp-rename')

gulp.task('test', function () {
  return gulp.src('./test/test_*.js', {read: false})
    .pipe(mocha({reporter: 'spec'}))
})

gulp.task('minify', ['test'], function () {
  return gulp.src('./src/jajom.js')
    .pipe(uglify())
    .pipe(rename('jajom.min.js'))
    .pipe(gulp.dest('./dist'))
})

gulp.task('default', ['test', 'minify'])