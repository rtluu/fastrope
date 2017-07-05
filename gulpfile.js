'use strict';

var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
     del = require('del'),
  useref = require('gulp-useref'),
     iff = require('gulp-if'),
    csso = require('gulp-csso'),
   pages = require('gulp-gh-pages'),
   imagemin = require('gulp-imagemin'),
   nunjucksRender = require('gulp-nunjucks-render'),
   browserSync = require('browser-sync').create();
;

var options = {
  app: './app/',
  dist: './dist/'
}


gulp.task('compileSass', function() {
  return gulp.src(options.app + 'scss/**/*.scss')
    .pipe(maps.init())
    .pipe(sass())
    .pipe(maps.write('./'))
    .pipe(gulp.dest(options.app + 'css/'));
});

gulp.task('html', ['compileSass'], function() {
  var assets = useref.assets();
  return gulp.src(options.app + 'index.html')
              .pipe(assets)
              .pipe(iff('*.css', csso()))
              .pipe(assets.restore())
              .pipe(useref())
              .pipe(gulp.dest(options.dist));
});

gulp.task('uglify', function() {
  gulp.src('app/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('watchFiles', function() {
  gulp.watch(options.app + 'scss/**/*.scss', ['compileSass']);
});

gulp.task('assets', function(){
  return gulp.src([options.app + 'img/**/*',
                   options.app + 'fonts/**/*'], {base: options.app})
          .pipe(gulp.dest(options.dist));
});

// watch sass
gulp.task('serve', ['compileSass', 'watchFiles']);

gulp.task('clean', function() {
  del([options.dist]);
  // delete compiles css and map
  del([options.app + 'css/main.css*']);
});

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('nunjucks', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('app/pages/**/*.+(html|nunjucks)')
  // Renders template with nunjucks
  .pipe(nunjucksRender({
      path: ['app/templates']
    }))
  // output files in app folder
  .pipe(gulp.dest('app'))
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  });
});

gulp.task('imagemin', () =>
    gulp.src('app/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))
);

gulp.task('build', ['html', 'assets', 'uglify', 'imagemin']);

gulp.task('deploy', function(){
  return gulp.src(options.dist + '**/*')
    .pipe(pages());
});

gulp.task('default', ['clean'], function(){
  gulp.start('build');
});
