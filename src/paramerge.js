(function() {
  'use strict';
  var 
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    utils = require('./utils'),
    exec = require('child_process').execSync;
  
  var ParaMerge = function() {
  };
  ParaMerge.prototype = {
    _doAllMoves: function(sources, target) {
      return sources.map(function(src) {
        var tempNodeModules = [src, 'node_modules'].join('/')
        var folders = fs.readdirSync(tempNodeModules).filter(function(p) {
          return p !== '.bin';
        });
        return folders.map(function(f) {
          var copyTo = [target, f].join('/');
          var initial = Promise.resolve({});
          var moduleSource = [tempNodeModules, f].join('/');
          initial = initial.then(function() {
            if (!utils.exists(copyTo)) {
              fs.renameSync(moduleSource, copyTo);
            }
          });
          return initial;
        });
      });
    },
    _copyBins: function(sources, target) {
      var targetBin = [target, '.bin'].join('/');
      // this is where I've seen bins put on win32
      sources.forEach(function(src) {
        var allFiles = utils.ls(src);
        allFiles.filter(function(p) {
          return utils.fileExists(p);
        }).forEach(function(p) {
          utils.copyFile(p, [targetBin, path.basename(p)].join('/'));
        })
      });
      // and on *nix, they end up where you'd expect, in node_modules/.bin
      sources.forEach(function(src) {
        var binFiles = utils.ls([src, 'node_modules', '.bin'].join('/'));
        binFiles.filter(function(p) {
          return utils.exists(p);
        }).forEach(function(p) {
          utils.ensureFolderExists(targetBin);
          var cmd = 'cp -P "' + p + '" "' + [targetBin, path.basename(p)].join('/') + '"';
          // this is a horrible hack to copy the symlink
          console.log(cmd);
          exec(cmd);
        })
      });
    },
    _removeTempSources: function(sources) {
      return Promise.all(sources.map(function(s) {
        //return utils.rmdir(s);
      }));
    },
    merge: function(sources, target) {
      utils.ensureFolderExists(target);
      var allPromises = this._doAllMoves(sources, target);
      var flattened = [].concat.apply([], allPromises);
      var self = this;
      return Promise.all(flattened).then(function() {
        self._copyBins(sources, target);
      }).then(function() {
        return self._removeTempSources(sources);
      });
    }
  };
  
  module.exports = ParaMerge;
})();