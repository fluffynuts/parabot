(function() {
  'use strict';
  var 
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf'),
    utils = require('./utils');
  
  var ParaMerge = function() {
  };
  ParaMerge.prototype = {
    _doAllMoves: function(sources, target) {
      return sources.map(function(src) {
        var tempNodeModules = [src, 'node_modules'].join('/')
        var folders = fs.readdirSync(tempNodeModules);
        return folders.map(function(f) {
          var copyTo = [target, f].join('/');
          var initial = Promise.resolve({});
          if (utils.exists(copyTo)) {
            initial = initial.then(function() {
              return new Promise(function(resolve, reject) {
                setTimeout(function () {
                  utils.rmdir(copyTo).then(function() {
                    resolve();
                  });
                }, 1000);
              });
            });
          }
          var moduleSource = [tempNodeModules, f].join('/');
          initial = initial.then(function() {
            fs.renameSync(moduleSource, copyTo);
          });
          return initial;
        });
      });
    },
    _copyBins: function(sources, target) {
      var targetBin = [target, '.bin'].join('/');
      sources.forEach(function(src) {
        var allFiles = fs.readdirSync(src);
        allFiles.filter(function(p) {
          return utils.fileExists([src, p].join('/'));
        }).forEach(function(p) {
          utils.copyFile([src, p].join('/'), [targetBin, p].join('/'));
        })
      });
    },
    _removeTempSources: function(sources) {
      return Promise.all(sources.map(function(s) {
        return utils.rmdir(s);
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