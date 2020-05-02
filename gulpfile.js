// Initialize gulp + modules
const { src, dest, watch, series, parallel } = require('gulp');

// gulp plugins
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const ts = require('gulp-typescript'); 
const replace = require('gulp-replace');
const base64 = require('gulp-base64-inline'); //inline any css background images with base64 
const inlinesource = require('gulp-inline-source'); //inline js and css and images
const util = require('gulp-util'); //enables a dev and production build with minification
var production = !!util.env.production;

//clean up
const purgecss = require('gulp-purgecss'); //remove unused css
const del = require('del'); //plugin to delete temp files after build


// File paths
const files = { 
    scssPath: 'src/ui/styles/**/*.scss',
    cssPath: 'src/ui/tmp/*.css',
    jsPath: 'src/ui/js/**/*.js',
    tsPath: 'src/main/**/*.ts',
    html: 'src/ui/index.html',
    manifest: 'src/manifest.json'
}

// SCSS task: compiles the styles.scss file into styles.css
function scssTask(){    
    return src(files.scssPath)
        .pipe(sass()) //compile to css
        .pipe(purgecss({
            content: ['src/ui/index.html']
        }))
        .pipe(dest('src/ui/tmp') //put in temporary directory
    ); 
}

// CSS Task: inline any background images, add auto prefixing for browser support, and minify css
function cssTask(){    
    return src(files.cssPath)
        .pipe(replace('url(', 'inline('))
        .pipe(base64(''))
        .pipe(postcss([ autoprefixer(), cssnano()])) // PostCSS plugins
        .pipe(dest('src/ui/tmp')
    ); // put final CSS in dist folder
}

// JS task: concatenates JS files to scripts.js (minifies on production build)
function jsTask(){
    return src([files.jsPath])
        .pipe(concat('scripts.js'))
        .pipe(production ? uglify() : util.noop())
        .pipe(dest('src/ui/tmp')
    );
}

//TS task: compiles the typescript main code that interfaces with the figma plugin API
function tsTask() {
    return src('src/main/**/*.ts')
        .pipe(ts({
            noImplicitAny: true,
            outFile: 'code.js'
        }))
        .pipe(production ? uglify() : util.noop())
        .pipe(dest('dist'));
}

//HTML task: copies and minifies 
function htmlTask() {
    return src([files.html])
        .pipe(inlinesource({
            attribute: false
        }))
        .pipe(dest('dist'));
}

//Clean up temporary files
function cleanUp() {
    return del(['src/ui/tmp']);
}

//copy manifest file to dist
function manifestTask() {
    return src([files.manifest])
        .pipe(dest('dist')
    );
}


// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask(){
    watch([files.scssPath, files.jsPath, files.tsPath, files.html, files.manifest],
        {interval: 1000, usePolling: true}, 
        series(
            parallel(scssTask, jsTask, tsTask),
            cssTask,
            htmlTask,
            manifestTask,
            cleanUp
        )
    );    
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
    parallel(scssTask, jsTask, tsTask), 
    cssTask,
    htmlTask,
    manifestTask,
    cleanUp,
    watchTask
);