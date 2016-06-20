// you need a global gulp (you can install with:
// npm install -g gulp node-autorequire
// )
const actualGulp = require('gulp'),
        gulp = require('gulp-npm-run')(actualGulp, { npmRun: true }),
        mocha = require('gulp-mocha'),
        runSequence = require('run-sequence'),
        del = require('del'),
        ProgressReporter = require('mocha-yar')

ProgressReporter.setOptions({
    suppressOutputFrom: [
    ]
});

var rerunTests = false;

gulp.task('clean', function() {
    return del(['dist/*']);
});

gulp.task('watch', ['clean-test'], function() {
    const watcher = gulp.watch([
                      'test/**/*.js',
                      'src/**/*.js'], ['clean-test']);
    const log = console.log;
    watcher.on('change', function(ev) {
        log('-> ' + ev.type + ': ' + ev.path)
        rerunTests = true;
    })
});

gulp.task('clean-test', function(callback) {
    runSequence('clean', 'test-once', callback);
});

const runTests = function() {
    return gulp.src(['test/**/*.spec.js'], { read: false })
        .pipe(mocha({
            reporter: ProgressReporter,
            require: [
              './test/bootstrap'
            ],
            timeout: 5000,
        })).on('error', function(e) {
          console.log(e);
          // don't bail
          this.emit('end');
        });
};

gulp.task('test-once', function() {
    var result;
    do {
        rerunTests = false;
        result = runTests();
    } while (rerunTests);
    return result;
});
