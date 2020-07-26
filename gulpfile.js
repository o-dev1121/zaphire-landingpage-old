let browserSync = require('browser-sync');
let gulp = require('gulp');
let sass = require('gulp-sass');
let cleanCSS = require('gulp-clean-css');
let sourcemaps = require('gulp-sourcemaps');
let uglify = require('gulp-uglify');
let concat = require('gulp-concat');
let imageMin = require('gulp-imagemin');
let pngquant = require('imagemin-pngquant');




gulp.task('browserSync', () => {
    browserSync.init({
        proxy: "http://localhost/russia/",
        // server: {
        //     baseDir: "/"
        // },
        options: {
            reloadDelay: 250
        },
        notify: false
    });
});


gulp.task('build-css', () => {
    return gulp.src('assets/style/*.{scss,sass}')
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: 'compressed'
            //outputStyle: 'nested'
        }))
        .pipe(sourcemaps.write())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('assets/css'))
        // .pipe(browserSync.reload({stream: true}));
});


gulp.task('scripts', () => {
    return gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/css-browser-selector/css_browser_selector_dev.js',
        'node_modules/popper.js/dist/umd/popper.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/bootstrap-select/js/bootstrap-select.js',
        'node_modules/jquery-autogrow-textarea/dist/jquery.autogrow.min.js',
        'node_modules/slick-carousel/slick/slick.min.js',
        'node_modules/smooth-scrollbar/dist/smooth-scrollbar.js',
        'node_modules/jquery.easing/jquery.easing.js',
        'node_modules/jquery-ui/ui/widgets/datepicker.js',
        'node_modules/gsap/dist/gsap.min.js',
        'node_modules/gsap/dist/EasePack.min.js',
        'node_modules/scrollmagic/scrollmagic/minified/ScrollMagic.min.js',
        'node_modules/scrollmagic/scrollmagic/minified/plugins/animation.gsap.min.js',
        'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
        'assets/scripts/formValidation.js',
        'assets/scripts/gbootstrap.min.js',
        'node_modules/jquery-inview/jquery.inview.js'
    ])
        .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('assets/js'))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task('imageMin', () => {
    return gulp.src('assets/img/**/*/')
        .pipe(imageMin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant({quality: '50-100', speed: 5})]
        }))
        .pipe(gulp.dest('assets/images'))
});


gulp.task('watch', () => {
    gulp.watch(['assets/style/**/*.scss'], gulp.series('build-css'));
    gulp.watch(['assets/scripts/*.js'], gulp.series('scripts'));
    gulp.watch(['assets/img/*.*'], gulp.series('imageMin'));
});


// Create Gulp Default Task
gulp.task('default', gulp.parallel('watch', 'build-css', 'scripts', 'imageMin'));
