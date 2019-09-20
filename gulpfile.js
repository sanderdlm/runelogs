const { src, dest, parallel } = require('gulp');
const less = require('gulp-less');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const minify = require('gulp-minify');

function css() {
    return src('public/css/*.less')
        .pipe(less())
        .pipe(concat('main.css'))
        .pipe(minifyCSS())
        .pipe(dest('public/dist'))
}

function js() {
    return src(['public/js/lib/*.js', 'public/js/*.js'], { sourcemaps: true })
        .pipe(concat('app.js'))
        .pipe(minify({
            ext:{
                src:'.js',
                min:'.min.js'
            }
        }))
        .pipe(dest('public/dist', { sourcemaps: true }))
}

exports.js = js;
exports.css = css;
exports.default = parallel(css, js);