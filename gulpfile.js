// Initialize gulp + modules
const { src, dest, watch, series, parallel } = require('gulp');

// gulp plugins
const sass = require('gulp-sass'); //import SCSS compiler
const concat = require('gulp-concat'); //enables gulp to concatenate multiple JS files into one
const minify = require('gulp-minify'); //minifies JS
const postcss = require('gulp-postcss'); //handles processing of CSS and enables use of cssnano and autoprefixer
const autoprefixer = require('autoprefixer'); //handles autoprefixing for browser support
const csso = require('gulp-csso'); //css minification
const ts = require('gulp-typescript'); //typescript compiler
const replace = require('gulp-replace'); //replace a string in a file being processed
const base64 = require('gulp-base64-inline'); //inline any css background images with base64 
const inlinesource = require('gulp-inline-source'); //inline js and css and images
const htmlmin = require('gulp-htmlmin'); //minify html

//for signalling dev vs. prod build
const util = require('gulp-util'); //enables a dev and production build with minification
var production = !!util.env.production; //this keeps track of whether or not we are doing a normal or priduction build

//clean up post build
const purgecss = require('gulp-purgecss'); //remove unused css
const del = require('del'); //plugin to delete temp files after build

// TS Config
const tsProject = ts.createProject('tsconfig.json', { noImplicitAny: true, outFile: 'code.js' });

// File paths
const files = { 
    scssPath: 'src/ui/styles/**/*.scss', //path to your CSS/SCSS folder
    jsPath: 'src/ui/scripts/**/*.js', //path to any javascript that you use in your UI
    tsPath: 'src/main/**/*.ts', //location of typescript files for the main plugin code that interfaces with the Figma API
    html: 'src/ui/index.html', //this is your main index file where you will create your UI markup
    manifest: 'src/manifest.json', //location of manifest file
    assetsPath: 'src/ui/img/*.{png,gif,jpg,svg,jpeg}' //path to image assets for your UI
}

// SCSS task: compiles the styles.scss file into styles.css
function scssTask(){    
    return src(files.scssPath)
        .pipe(sass()) //compile to css
        .pipe(replace('background-image: url(', 'background-image: inline('))
        .pipe(base64('')) //base 64 encode any background images
        .pipe(postcss([ autoprefixer()])) // PostCSS plugins
        .pipe(production ? csso() : util.noop()) //minify css on production build
        .pipe(dest('src/ui/tmp') //put in temporary directory
    ); 
}

//CSS Task: Process Figma Plugin DS CSS
function cssTask() {
    return src('node_modules/figma-plugin-ds/dist/figma-plugin-ds.css')
        .pipe(production ? purgecss({
            content: ['src/ui/index.html', 'src/ui/tmp/scripts.js'],
            whitelistPatterns: [/select-menu(.*)/],
        }) : util.noop()) //remove unused CSS
       .pipe(production ? csso() : util.noop()) //minify css on production build
        .pipe(dest('src/ui/tmp') //put in temporary directory
    );
}

// JS task: concatenates JS files to scripts.js (minifies on production build)
function jsTask(){
    return src(['node_modules/figma-plugin-ds/dist/iife/figma-plugin-ds.js', files.jsPath])
        .pipe(concat('scripts.js'))
        .pipe(dest('src/ui/tmp')
    );
}

//TS task: compiles the typescript main code that interfaces with the figma plugin API
function tsTask() {
    return src([files.tsPath])
        .pipe(tsProject())
        .pipe(production ? minify({
            ext: {
                min: '.js'
            },
            noSource: true
        }) : util.noop())
        .pipe(dest('dist'));
}

//HTML task: copies and minifies 
function htmlTask() {
    return src([files.html])
        .pipe(inlinesource({
            attribute: false,
            compress: production ? true : false,
            pretty: true
        }))
       .pipe(production ? htmlmin({ collapseWhitespace: true }) : util.noop())
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


// Watch all key files for changes, if there is a change saved, create a build 
function watchTask(){
    watch([files.scssPath, files.jsPath, files.tsPath, files.html, files.manifest],
        {interval: 1000, usePolling: true}, 
        series(
            parallel(jsTask, tsTask),
            scssTask,
            cssTask,
            htmlTask,
            manifestTask,
            cleanUp
        )
    );    
}

// Export the default Gulp task so it can be run
// Runs the scss, js, and typescript tasks simultaneously
exports.default = series(
    parallel(jsTask, tsTask),
    scssTask,
    cssTask,
    htmlTask,
    manifestTask,
    cleanUp,
    watchTask
);