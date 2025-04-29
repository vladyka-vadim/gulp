import gulp from 'gulp'
import path from "path"
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';
import fileInclude from 'gulp-file-include';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const scss = gulpSass(dartSass);
import gulpRename from 'gulp-rename'
import browserSync from 'browser-sync'
import webpHtml from 'gulp-webp-html-nosvg';
import groupMedia from 'gulp-group-css-media-queries'
import gulpAutoprefixer from 'gulp-autoprefixer';
import webpCss from 'gulp-webpcss';
import gulpImagemin from 'gulp-imagemin'
import imageminWebp from "imagemin-webp";
import gulpUglify from "gulp-uglify"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);
const project_name = path.basename(__dirname);
import del from 'del';

function html() {
    return gulp.src(['./#src/**/*.html', "!" + './#src/_*.html'], {})
        .pipe(fileInclude())
        .pipe(gulp.dest(project_name + '/'))
        .pipe(browserSync.stream());
}


function css() {
    return gulp.src(['./#src/scss/style.scss'])
        .pipe(
            scss({ outputStyle: 'expanded' }).on('error', scss.logError)
        )
        .pipe(
            gulpRename({
                suffix: ".min",
                extname: ".css"
            })
        )
        .pipe(gulp.dest(project_name + '/css/'))
        .pipe(browserSync.stream());
}


function js() {
    return gulp.src(['./#src/js/app.js', './#src/js/vendors.js'])
        .pipe(fileInclude())
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(
            gulpRename({
                suffix: ".min",
                extname: ".js"
            })
        )
        .pipe(gulp.dest(project_name + '/js/'))
        .pipe(browserSync.stream());
}

function fonts() {

    gulp.src(["#src/fonts/*.ttf"], {
        encoding: false, // Important!
        removeBOM: false,
    })
        .pipe(ttf2woff())
        .pipe(gulp.dest(project_name + '/fonts/'))


    return gulp.src(["#src/fonts/*.ttf"], {
        encoding: false, // Important!
        removeBOM: false,
    })
        .pipe(ttf2woff2())
        .pipe(gulp.dest(project_name + '/fonts/'))
        .pipe(browserSync.stream());
}



function images() {
    return gulp.src("./#src/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}", {
        encoding: false
    })
        .pipe(gulp.dest(project_name + '/img/'))
        .pipe(browserSync.stream());
}


function watchFiles (){
    gulp.watch(['./#src/**/*.html'], html);
    gulp.watch(['./#src/scss/**/*.scss'], css)
    gulp.watch(['./#src/js/**/*.js'], js)
    gulp.watch(['./#src/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}'], images)
}


function browsersync(done) {
    browserSync.init({
        server: {
            baseDir: "./" + project_name + "/"
        },
        notify: false,
        port: 3000,
    });
}


function htmlBuild() {
    return gulp.src(['./#src/**/*.html', "!" + './#src/_*.html'], {})
        .pipe(fileInclude())
        .pipe(webpHtml())
        .pipe(fileInclude())
        .pipe(gulp.dest(project_name + '/'))
        .pipe(browserSync.stream());
}


function imagesBuild() {
        return gulp.src("./#src/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}", {
        encoding: false
        })
        .pipe(
            gulpImagemin([
                imageminWebp({
                    quality: 85
                })
            ])
        )
        .pipe(
            gulpRename({
                extname: ".webp"
            })
        )
        .pipe(gulp.dest(project_name + '/img/'))
        .pipe(gulp.src("./#src/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}", {
            encoding: false
        }))
        .pipe(
            gulpImagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3 // 0 to 7
            })
        )
        .pipe(gulp.dest(project_name + '/img/'))
}



function cssBuild() {
    return gulp.src(['./#src/scss/style.scss'], {})
        .pipe(
            scss({ outputStyle: 'expanded' }).on('error', scss.logError)
        )
        .pipe(groupMedia())
        .pipe(
            gulpAutoprefixer({
                grid: true,
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
        )
        .pipe(webpCss(
            {
                webpClass: "._webp",
                noWebpClass: "._no-webp"
            }
        ))
        .pipe(
            gulpRename({
                extname: ".min.css"
            })
        )
        .pipe(gulp.dest(project_name + '/css/'))
        .pipe(browserSync.stream());
}

function jsBuild() {
    return gulp.src(['./#src/js/app.js', './#src/js/vendors.js'], {})
        .pipe(fileInclude())
        .pipe(gulpUglify())
        .pipe(
            gulpRename({
                suffix: ".min",
                extname: ".js"
            })
        )
        .pipe(gulp.dest(project_name + '/js/'))
        .pipe(browserSync.stream());
}


function clean() {
    return del(["./" + project_name + "/"]);
}

const dev = gulp.series(clean, html, css, js, fonts, images, gulp.parallel(browsersync, watchFiles))

const build = gulp.series(htmlBuild, imagesBuild, cssBuild, jsBuild, gulp.parallel(browsersync))

export default dev;

export {build};