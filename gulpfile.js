'use strict';


var zip = require('gulp-zip');

var clean = require('gulp-clean');
var bump = require('gulp-bump');

var gulp = require('gulp');
var gutil = require( 'gulp-util' );
var ftp = require( 'vinyl-ftp' );
const debug = require('gulp-debug');
const filter = require('gulp-filter');
const chmod = require('gulp-chmod');
const merge = require('merge-stream');
const newer = require('gulp-newer');

var logins = require('./logins.json');

gulp.task('all',['vendor','mainfiles','textfiles','ini','lib']);

var bintrayopts = {
    username: 'mbwhite',
    organization: 'calanais',
    repository: 'BCDEmail',
    pkg: {
        name: 'BCDEmail'
    },
    apikey: logins.bintraykey,
    baseUrl: null                // default: Bintray.apiBaseUrl
};

// copy all the (newer) files to the 'dist' directory
gulp.task('copyfiles', function() {
   // let vendor = gulp.src('vendor/**').pipe(newer('dist/vendor')).pipe(gulp.dest('dist/vendor'));
   let tentcss = gulp.src('node_modules/tent-css/dist/**').pipe(newer('dist/lib/tentcss')).pipe(gulp.dest('dist/lib/tentcss'));
   let lightbox2 = gulp.src('node_modules/lightbox2/dist/**').pipe(newer('dist/lib/lightbox2')).pipe(gulp.dest('dist/lib/lightbox2'));
   let php = gulp.src('app/*.php').pipe(newer('dist')).pipe(chmod(0o755)).pipe(gulp.dest('dist/'));
   let img = gulp.src('imagedata/**').pipe(newer('dist')).pipe(gulp.dest('dist/'));
   let html = gulp.src('app/*.html').pipe(newer('dist')).pipe(gulp.dest('dist'));

   return merge(tentcss,lightbox2,php,img,html);

});

// ------------------------------------------------------------------
gulp.task('bump-json', function() {
    return gulp.src('./package.json')
        .pipe(bump({type:'patch'}))
        .pipe(gulp.dest('./'));
});

gulp.task('bump-ini', function() {
    return gulp.src('./app/bcdemail.ini')
        .pipe(bump({type:'patch'}))
        .pipe(gulp.dest('./app'));
});


gulp.task('bintray', ['bump-json','bump-ini'], function() {

   let version=require('./package.json').version;

    return gulp.src([ 'dist/**/*' ])
        .pipe(zip('bcdemail-'+version+'.zip'))
        .pipe(gulp.dest('.'))
        .pipe(bintray(bintrayopts))
        //.pipe(clean())
});

// Upload to the temporary ftp location
gulp.task( 'ftpdeploy',['copyfiles'],function () {

	var conn = ftp.create( {
		host:     'ftp.proterra.me.uk',
		user:     'mbwhite',
		password: logins.ftppwd,
		parallel: 5,
		log:      gutil.log
	} );

	var globs = [
		'dist/**/*'
	];

	// using base = '.' will transfer everything to /public_html correctly
	// turn off buffering in gulp.src for best performance
	return gulp.src( globs, { base: 'dist', buffer: false } )
      .pipe( conn.newer( '/public_html/osprey-voting' ) ) // only upload newer files
		.pipe( conn.dest( '/public_html/osprey-voting' ) )
} );
