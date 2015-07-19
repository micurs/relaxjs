/*
 * relaxjs compile and packaging
 * by Michele Ursino
 * version 0.2.0
*/

var gulp = require('gulp');
var print = require('gulp-print');
var tsc  = require('gulp-tsc');
var shell = require('gulp-shell');

var sourcemaps = require('gulp-sourcemaps');

function showsTscError(err) {
  console.log('tsc Error:', err.toString());
  this.emit('end'); // This is the command that stop gulp from exiting.
}

// --------------------------------------------------------------------------------

var tsc_sub_modules_opts = {
  module: 'commonjs',
  target: 'ES5',
  declaration: false,
  sourcemap: true,
  emitError: false,
  removeComments: false,
  outDir: 'dist',
  sourceRoot: '../src'
};

var relaxjs_modules = [ './src/interanls.ts', './src/routing.ts', './src/relaxjs.ts' ];

gulp.task('relaxjs', function(){
  return gulp.src( relaxjs_modules )
        .pipe( print( function(fp) { return '[relaxjs] tsc << '+ fp ; } ) )
        .pipe( tsc( tsc_sub_modules_opts) )
        .on('error', showsTscError )
        .pipe( print( function(fp) { return '[relaxjs] tsc >> '+ fp ; } ) )
        .pipe( gulp.dest('./dist'));
});


// Typedef generation task
// --------------------------------------------------------------------------------

var relaxjs_dts_opts = {
  target: 'ES5',
  module: 'commonjs',
  declaration: true,
  removeComments: false,
  out: 'relaxjs.d.ts'
};

gulp.task('relaxjs_d_ts', [ 'relaxjs' ], function () {
  return gulp.src( [ './src/relaxjs.ts' ])
        .pipe(print(function (fp) { return "[relaxjs_d_ts] tsd << " + fp; }))
        .pipe(shell(['dts-generator --name relaxjs --main relaxjs.ts --baseDir src --out relaxjs.d.ts routing.ts internals.ts relaxjs.ts']))
        .pipe(print(function (fp) { return "[relaxjs_d_ts] tsd >> " + fp; }))
        .pipe( gulp.dest('/dist') );
});


// watch task
// ----------------------------------------------------

gulp.task('watch', function () {
  gulp.watch( relaxjs_modules , [ 'relaxjs', 'relaxjs_d_ts' ]);
});

gulp.task( 'default', ['relaxjs', 'relaxjs_d_ts']);
