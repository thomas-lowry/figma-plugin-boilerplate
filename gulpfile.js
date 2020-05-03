// Initialize gulp + modules
const { src, dest, watch, series, parallel } = require('gulp');

// gulp plugins
const sass = require('gulp-sass'); //import SCSS compiler
const concat = require('gulp-concat'); //enables gulp to concatenate multiple JS files into one
const uglify = require('gulp-uglify'); //minifies JS
const postcss = require('gulp-postcss'); //handles processing of CSS and enables use of cssnano and autoprefixer
const autoprefixer = require('autoprefixer'); //handles autoprefixing for browser support
const cssnano = require('cssnano'); //handles CSS minification
const ts = require('gulp-typescript'); //typescript compiler
const replace = require('gulp-replace'); //replace a string in a file being processed
const base64 = require('gulp-base64-inline'); //inline any css background images with base64 
const inlinesource = require('gulp-inline-source'); //inline js and css and images
const util = require('gulp-util'); //enables a dev and production build with minification
var production = !!util.env.production; //this keeps track of whether or not we are doing a normal or priduction build

//clean up
const purgecss = require('gulp-purgecss'); //remove unused css
const del = require('del'); //plugin to delete temp files after build

// TS configuration for UI
//change this to true if you want to write your UI Javascript in Typescript as well
// you will also need to rename scripts.js to scripts.ts
let tsUI = false;

// File paths
const files = { 
    scssPath: 'src/ui/styles/**/*.scss', //path to your CSS/SCSS folder
    cssPath: 'src/ui/tmp/*.css', //references CSS compiled in temp directory before inlining
    jsPathUI: 'src/ui/scripts/**/*.js', //path to any javascript that you use in your UI
    tsPathUI: 'src/ui/scripts/**/*.ts', //only gets used if you choose to use typescript for your UI code (see tsUI var above)
    tsPath: 'src/main/**/*.ts', //location of typescript files for the main plugin code that interfaces with the Figma API
    html: 'src/ui/index.html', //this is your main index file where you will create your UI markup
    manifest: 'src/manifest.json', //location of manifest file
    assetsPath: 'src/ui/img/*.{png,gif,jpg,svg,jpeg}' //path to image assets for your UI
}

// SCSS task: compiles the styles.scss file into styles.css
function scssTask(){    
    return src(files.scssPath)
        .pipe(sass()) //compile to css
        .pipe(production ? purgecss({content: ['src/ui/index.html']}) : util.noop())
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
function uiTask(){
    if (tsUI) {
        return src([files.tsPathUI])
            .pipe(ts({
                noImplicitAny: true,
                outFile: 'code.js'
            }))
            .pipe(production ? uglify() : util.noop())
            .pipe(dest('src/ui/tmp')
         );
    } else {
        return src([files.jsPathUI])
            .pipe(concat('scripts.js'))
            .pipe(production ? uglify() : util.noop())
            .pipe(dest('src/ui/tmp')
         );
    }
}

//TS task: compiles the typescript main code that interfaces with the figma plugin API
function tsTask() {
    return src([files.tsPath])
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


// Watch all key files for changes, if there is a change saved, create a build 
function watchTask(){
    watch([files.scssPath, files.jsPathUI, files.tsPath, files.html, files.manifest],
        {interval: 1000, usePolling: true}, 
        series(
            parallel(scssTask, uiTask, tsTask),
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
    parallel(scssTask, uiTask, tsTask), 
    cssTask,
    htmlTask,
    manifestTask,
    cleanUp,
    watchTask
);