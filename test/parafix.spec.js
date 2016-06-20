var
  ParaFix = require('../src/parafix'),
  expect = require('chai').expect,
  fs = require('fs'),
  rimraf = require('rimraf');

describe('BinFixer', function() {
  describe('module', function() {
    it('should export the BinFixer prototype', function () {
      // Arrange
      // Act
      // Assert
      expect(ParaFix).to.exist;
      expect(ParaFix).to.be.a('function');
    });
    describe('proto', function() {
      it('should have a fix function', function () {
        // Arrange
        // Act
        // Assert
        expect(ParaFix.prototype.fix).to.be.a('function');
      });
    });
    describe('fix', function() {
      beforeEach(function (done) {
        rimraf('temp', function() {
          fs.mkdirSync('temp');
          done();
        });
      });
      afterEach(function (done) {
        rimraf('temp', function() {
          done();
        })
      });
      function create() {
        return new ParaFix();
      }
      it('should not change a file containing none of the magic stuff', function () {
        // Arrange
        var 
          contents = [
            '#!/bin.sh',
            'echo "Hello World!"'
          ].join('\n'),
          sut = create();
        fs.writeFileSync('temp/binfile', contents);
        // Act
        sut.fix('temp');
        // Assert
        var after = fs.readFileSync('temp/binfile');
        expect(after.toString()).to.equal(contents);
      });
      it('should update a shell script containing $basedir/node_modules/ to $basedir/../', function () {
        // Arrange
        var 
          contents = [
            '#!/bin/sh',
            'basedir=$(dirname "$(echo "$0" | sed -e \'s,\\,/,g\')")',
            'case `uname` in',
            '    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;',
            'esac',
            'if [ -x "$basedir/node" ]; then',
            '  "$basedir/node"  "$basedir/node_modules/rimraf/bin.js" "$@"',
            '  ret=$?',
            'else ',
            '  node  "$basedir/node_modules/rimraf/bin.js" "$@"',
            '  ret=$?',
            'fi',
            'exit $ret'
          ].join('\n'),
          expected = [
            '#!/bin/sh',
            'basedir=$(dirname "$(echo "$0" | sed -e \'s,\\,/,g\')")',
            'case `uname` in',
            '    *CYGWIN*) basedir=`cygpath -w "$basedir"`;;',
            'esac',
            'if [ -x "$basedir/node" ]; then',
            '  "$basedir/node"  "$basedir/../rimraf/bin.js" "$@"',
            '  ret=$?',
            'else ',
            '  node  "$basedir/../rimraf/bin.js" "$@"',
            '  ret=$?',
            'fi',
            'exit $ret'
          ].join('\n'),
          sut = create();
        fs.writeFileSync('temp/binfile', contents);
        // Act
        sut.fix('temp');
        // Assert
        var after = fs.readFileSync('temp/binfile').toString();
        expect(after).to.equal(expected);
      });
      it('should update a batch file containing %~dp0\\node_modules\\ to have %~dp0\\..\\', function() {
        // Arrange
        var 
          contents = [
            '@IF EXIST "%~dp0\\node.exe" (',
            '  "%~dp0\\node.exe"  "%~dp0\\node_modules\\rimraf\\bin.js" %*',
            ') ELSE (',
            '  @SETLOCAL',
            '  @SET PATHEXT=%PATHEXT:;.JS;=;%',
            '  node  "%~dp0\\node_modules\\rimraf\\bin.js" %*',
            ')'
          ].join('\n'),
          expected = [
            '@IF EXIST "%~dp0\\node.exe" (',
            '  "%~dp0\\node.exe"  "%~dp0\\..\\rimraf\\bin.js" %*',
            ') ELSE (',
            '  @SETLOCAL',
            '  @SET PATHEXT=%PATHEXT:;.JS;=;%',
            '  node  "%~dp0\\..\\rimraf\\bin.js" %*',
            ')'
          ].join('\n'),
          sut = create();
        fs.writeFileSync('temp/binfile.cmd', contents);
        // Act
        sut.fix('temp');
        // Assert
        var after = fs.readFileSync('temp/binfile.cmd').toString();
        expect(after).to.equal(expected);
      });
    });
  });
});