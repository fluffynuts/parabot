(function() {
  'use strict';
  var
    fs = require('fs'),
    rimraf = require('rimraf'),
    path = require('path');
    
  function copyFile(src, dst) {
    ensureFolderExists(path.dirname(dst));
    fs.writeFileSync(dst, fs.readFileSync(src));
  }
  
  function rmdir(p) {
    return new Promise(function(resolve, reject) {
      rimraf(p, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      })
    })
  }

  function exists(somePath, qualifier) {
    try {
      var statInfo = fs.statSync(somePath);
      qualifier = qualifier || function() { return true; }
      return qualifier(statInfo);
    } catch (e) {
      return false;
    }
  }
  function fileExists(somePath) {
    return exists(somePath, function(stat) {
      return stat.isFile();
    });
  }
  function folderExists(somePath) {
    return exists(somePath, function(stat) {
      return stat.isDirectory();
    });
  }
  
  function ensureFolderExists(folderPath) {
    var parts = folderPath.split('/');
    var current = '';
    do {
      if (current) {
        current += '/';
      }
      current += parts.shift();
      if (!folderExists(current)) {
        if (fileExists(current)) {
          fs.unlinkSync(current);
        }
        fs.mkdirSync(current);
      }
    } while (parts.length);
  }

  module.exports = {
    copyFile: copyFile,
    rmdir: rmdir,
    exists: exists,
    fileExists: fileExists,
    folderExists: folderExists,
    ensureFolderExists: ensureFolderExists
  };
})();