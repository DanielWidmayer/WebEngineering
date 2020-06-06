'use strict';   
// Load plugins
const autoprefixer = require('gulp-autoprefixer');
const browsersync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const gulp = require('gulp');
const header = require('gulp-header');
const merge = require('merge-stream');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglifyes = require('uglify-es');
const composer = require('gulp-uglify/composer');
const uglify = composer(uglifyes, console);
const nodemon = require('nodemon');
var notify = require('gulp-notify');

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n', ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n', ' * Copyright ' + new Date().getFullYear(), ' <%= pkg.author %>\n', ' */\n', '\n'].join('');

function startServer(done) {
    // configure nodemon
    nodemon({
        // the script to run the app
        script: 'server.js',
        // this listens to changes in any of these files/routes and restarts the application
        watch: ['server.js'], //, 'public/**', 'public/*/**'
        ext: 'js',
        // Below i'm using es6 arrow functions but you can remove the arrow and have it a normal .on('restart', function() { // then place your stuff in here }
    }).on('restart', () => {
        gulp.src('server.js')
            // I've added notify, which displays a message on restart. Was more for me to test so you can remove this
            .pipe(notify('Restarting Server'));
    });
    browsersync.init({
        proxy: 'http://localhost:6001',
    });
    done();
}

// BrowserSync reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Clean vendor
function clean() {
    return del(['./vendor/', './public/vendor']);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
    // Bootstrap JS
    var bootstrapJS = gulp.src('./node_modules/bootstrap/dist/js/*').pipe(gulp.dest('./public/vendor/bootstrap/js'));
    // Bootstrap SCSS
    var bootstrapSCSS = gulp.src('./node_modules/bootstrap/scss/**/*').pipe(gulp.dest('./public/vendor/bootstrap/scss'));
    // ChartJS
    var chartJS = gulp.src('./node_modules/chart.js/dist/*.js').pipe(gulp.dest('./public/vendor/chart.js'));
    // Font Awesome
    //var fontAwesome = gulp.src('./node_modules/@fortawesome/**/*').pipe(gulp.dest('./vendor'));
    // jQuery
    var jquery = gulp.src(['./node_modules/jquery/dist/*', '!./node_modules/jquery/dist/core.js']).pipe(gulp.dest('./public/vendor/jquery'));
    return merge(bootstrapJS, bootstrapSCSS, jquery, chartJS); //  jquery, jqueryEasing //, dataTables, fontAwesome,
}

// CSS task
function css() {
    return gulp
        .src(['./public/scss/*.scss', './public/vendor/bootstrap/scss/bootstrap.scss'])
        .pipe(plumber())
        .pipe(
            sass({
                outputStyle: 'expanded',
                includePaths: './node_modules',
            })
        )
        .on('error', sass.logError)
        .pipe(
            autoprefixer({
                cascade: false,
            })
        )
        .pipe(
            header(banner, {
                pkg: pkg,
            })
        )
        .pipe(gulp.dest('./public/stylesheets'))
        .pipe(
            rename({
                suffix: '.min',
            })
        )
        .pipe(cleanCSS())
        .pipe(gulp.dest('./public/stylesheets'))
        .pipe(browsersync.stream());
}

// JS task
function js() {
    return gulp
        .src(['./public/js/*.js', '!./public/js/*.min.js'])
        .pipe(uglify())
        .pipe(
            header(banner, {
                pkg: pkg,
            })
        )
        .pipe(
            rename({
                suffix: '.min',
            })
        )
        .pipe(gulp.dest('./public/js'));
}

// Watch files
function watchFiles() {
    gulp.watch('./public/scss/**/*', css);
    gulp.watch(['./public/js/**/*', './*.js', '!./public/js/**/*.min.js'], gulp.parallel(js, browserSyncReload));
    gulp.watch('./public/**/*.html', browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js));
const watch = gulp.series(build, gulp.parallel(watchFiles, startServer));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
