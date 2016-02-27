/*
 * relaxjs compile and packaging
 * by Michele Ursino
 * version 0.2.0
*/

var gulp = require('gulp');
var print = require('gulp-print');
var tsc  = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var shell = require('gulp-shell');
var merge = require('merge2');
var dts = require('dts-bundle');

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

var tsProject = tsc.createProject('./tsconfig.json',  { sortOutput: true } );

var relaxjs_modules = [
  './src/interanls.ts',
  './src/routing.ts',
  './src/relaxjs.ts'
];

gulp.task('relaxjs', function(){
  var res = tsProject.src( relaxjs_modules )
        .pipe( print( function(fp) { return '[relaxjs] tsc << '+ fp ; } ) )
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe( tsc(tsProject) )
        .on('error', showsTscError );

  return merge([
    res.dts.pipe( gulp.dest('./dist/typings') ),
    res.js
      .pipe( sourcemaps.write('.') )
      .pipe( gulp.dest('./dist') )
  ]);

});


// Typedef generation task
// --------------------------------------------------------------------------------

var dts_bundle_options = {
  name: 'relaxjs',
  main: './dist/typings/relaxjs.d.ts',
  indent: ' ',
  baseDir: './dist/typings',
  out: 'relaxjs.d.ts',
  emitOnIncludedFileNotFound: true,
  emitOnNoIncludedFileNotFound: true,
  exclude: function( file, external ) {
    if ( external ) return true;
    if ( file.indexOf('internals') >= 0 ) return true;
    return false;
  }
};

gulp.task('dts', ['relaxjs' ], function() {
  return dts.bundle(dts_bundle_options);
});

// var relaxjs_dts_opts = {
//   target: 'ES5',
//   module: 'commonjs',
//   declaration: true,
//   removeComments: true,
//   out: 'relaxjs.d.ts',
//   outDir: 'dist',
//   sourceRoot: '../src'
// };

// gulp.task('relaxjs_d_ts', function () {
//   return gulp.src( [ './src/relaxjs.ts' ])
//         .pipe(print(function (fp) { return "[relaxjs_d_ts] tsd << " + fp; }))
//         .pipe(shell(['dts-generator --name relaxjs --main relaxjs/relaxjs --baseDir src --exclude internals.ts --out dist/update_relaxjs.d.ts internals.ts routing.ts relaxjs.ts']))
//         .pipe(print(function (fp) { return "[relaxjs_d_ts] tsd >> " + fp; }))
//         .pipe( gulp.dest('/dist') );
// });

// unit test task
// ----------------------------------------------------

gulp.task('test', shell.task(['jasmine-node --verbose --color tests']) );

// watch task
// ----------------------------------------------------

gulp.task('watch', function () {
  gulp.watch( relaxjs_modules , [ 'relaxjs', 'relaxjs_d_ts' ]);
});

gulp.task( 'default', ['dts']);
