var 
  Parabot = require('../src/parabot'),
  process = require('process'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  fs = require('fs');

describe('Parabot', function() {
  var sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });
  afterEach(function() {
    sandbox.restore();
  });
  describe('module', function() {
    it('will export the parabot', function() {
      // Arrange
      // Act
      // Assert
      expect(Parabot).to.exist; // jshint: ignore:line
    });
    describe('exported object', function() {
      var create = function() {
        return new Parabot();
      };
      describe('install', function() {
        it('will exist as a function', function() {
          // Arrange
          // Act
          // Assert
          expect(Parabot.prototype.install).to.be.a('function');
        });
      })
      describe('_findAllRequiredPackages', function() {
        it('will exist as a function', () => {
          // Arrange
          // Act
          // Assert
          expect(Parabot.prototype._findAllRequiredPackages).to.be.a('function')
        });
        it('will return all packages in the dependencies section and devDependencies section', function() {
          // Arrange
          var 
            dep1 = { 'dev package 1': '^0.0.1' },
            dep2 = { 'dev package 2': '^1.2.3' },
            dep3 = { 'package 1': '2.3.4' },
            dep4 = { 'package 2': 'a.b.c' },
            src = {
              name: 'Some package',
              devDependencies: {
                'dev package 1': '^0.0.1',
                'dev package 2': '^1.2.3'
              },
              dependencies: {
                'package 1': '2.3.4',
                'package 2': 'a.b.c'
              }
            },
            parabot = new Parabot();
          sandbox.stub(parabot, '_readPackageContents').returns(JSON.stringify(src));
          // Act
          var result = parabot._findAllRequiredPackages();
          // Assert
          expect(result).to.exist;
          expect(result).to.have.length(4);
          expect(result).to.contain(dep1);
          expect(result).to.contain(dep2);
          expect(result).to.contain(dep3);
          expect(result).to.contain(dep4);
        });
      })
      describe('_readPackageContents', function() {
        var cwd;
        beforeEach(function() {
          cwd = process.cwd();
        })
        afterEach(function() {
          process.chdir(cwd);
        })
        it('will return the raw contents of the closest package.json (1)', () => {
          // Arrange
          var 
            expected = fs.readFileSync('package.json'),
            parabot = create();
          // Act
          var result = parabot._readPackageContents()
          // Assert
          expect(result.toString()).to.equal(expected.toString())
        });
        it('will return the raw contents of the closest package.json (2)', () => {
          // Arrange
          process.chdir('test');
          var 
            expected = fs.readFileSync('../package.json')
            parabot = create();
          // Act
          var result = parabot._readPackageContents()
          // Assert
          expect(result.toString()).to.equal(expected.toString())
        });
      })
    });
  })
})