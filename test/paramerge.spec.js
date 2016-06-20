var
  ParaMerge = require('../src/paramerge'),
  expect = require('chai').expect,
  fs = require('fs'),
  rimraf = require('rimraf');

describe('ParaMerge', function () {
  describe('module', function () {
    it('should export the ParaMerge prototype', function () {
      // Arrange
      // Act
      // Assert
      expect(ParaMerge).to.exist;
      expect(ParaMerge.prototype).to.exist;
    });
  })
  describe('ParaMerge', function () {
    it('should have a merge function', function () {
      // Arrange
      // Act
      // Assert
      expect(ParaMerge.prototype.merge).to.be.a('function');
    });
    function create() {
      return new ParaMerge();
    }
    describe('merge', function() {
      it('should do nothing if the source is empty', function () {
        // Arrange
        var sut = create();
        // Act
        expect(function() {
          sut.merge();
          sut.merge([]);
          sut.merge(null);
        }).not.to.throw;
        // Assert
      });
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
      function ensureFolderExists(folderPath) {
        var parts = folderPath.split('/');
        var current = '';
        do {
          if (current) {
            current += '/';
          }
          current += parts.shift();
          if (!fs.existsSync(current)) {
            fs.mkdirSync(current);
          }
        } while (parts.length);
      }

      it('should move the one folder that doesn\'t exist to the target', function () {
        // Arrange
        var
          expected = 'some contents',
          sut = create();
        ensureFolderExists('temp/src1/node_modules/module_a');
        ensureFolderExists('temp/node_modules');
        fs.writeFileSync('temp/src1/node_modules/module_a/index.js', expected);

        // Act
        return sut.merge(['temp/src1'], 'temp/node_modules').then(function() {
          // Assert
          expect(fs.existsSync('temp/node_modules/module_a')).to.be.true;
          var indexFile = 'temp/node_modules/module_a/index.js';
          expect(fs.existsSync(indexFile)).to.be.true;
          expect(fs.readFileSync(indexFile).toString()).to.equal(expected);
        });
      });

      it('should copy files in the src dir to the target\'s .bin folder', function() {
        // Arrange
        var
          expected = 'some contents',
          expected2 = 'some file',
          sut = create();
        ensureFolderExists('temp/src1/node_modules/module_a');
        ensureFolderExists('temp/node_modules');
        fs.writeFileSync('temp/src1/node_modules/module_a/index.js', expected);
        fs.writeFileSync('temp/src1/some-bin', expected2);
        // Act
        return sut.merge(['temp/src1'], 'temp/node_modules').then(function() {
          // Assert
          expect(fs.existsSync('temp/node_modules/module_a')).to.be.true;
          var indexFile = 'temp/node_modules/module_a/index.js';
          expect(fs.existsSync(indexFile)).to.be.true;
          expect(fs.readFileSync(indexFile).toString()).to.equal(expected);
          var binFile = 'temp/node_modules/.bin/some-bin';
          expect(fs.existsSync(binFile)).to.be.true;
          expect(fs.readFileSync(binFile).toString()).to.equal(expected2);
        });
      });

      it('should not overwrite the existing folder at the target', function () {
        // Arrange
        var
          unexpected = 'some contents',
          expected = 'moo, said the cow',
          sut = create();
        ensureFolderExists('temp/src1/node_modules/module_a');
        ensureFolderExists('temp/node_modules');
        fs.writeFileSync('temp/src1/node_modules/module_a/index.js', expected);
        ensureFolderExists('temp/node_modules/module_a');
        fs.writeFileSync('temp/node_modules/module_a/index.js', unexpected);

        // Act
        return sut.merge(['temp/src1'], 'temp/node_modules').then(function() {
        // Assert
          expect(fs.existsSync('temp/node_modules/module_a')).to.be.true;
          var indexFile = 'temp/node_modules/module_a/index.js';
          expect(fs.existsSync(indexFile)).to.be.true;
          expect(fs.readFileSync(indexFile).toString()).to.equal(expected);
        });
      });
    })
  });
})