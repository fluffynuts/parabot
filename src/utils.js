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

  function lsR(folder) {
    if (!folderExists(folder)) {
      return [];
    }
    var inFolder = fs.readdirSync(folder).map(function(entry) {
      var fullPath = [folder, entry].join('/');
      if (folderExists(fullPath)) {
        return [fullPath].concat(flatten(lsR(fullPath)));
      } else {
        return fullPath;
      }
    });
  }

  function ls(folder) {
    if (!folderExists(folder)) {
      return [];
    }
    return fs.readdirSync(folder).map(function(entry) {
      return [folder, entry].join('/');
    });
  }

  function flatten(a) {
    return [].concat.apply([], a);
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
  
  function isSymLink(somePath) {
    return exists(somePath) ? fs.statSync(somePath).isSymbolicLink() : false;
  }

  function trimCarriageReturn(s) {
    return s.replace(/\r$/, '');
  }
  
  function readLines(someFile) {
    if (!fileExists(someFile)) {
      return []
    }
    return fileExists(someFile)
            ? fs.readFileSync(someFile).toString().split('\n').map(trimCarriageReturn)
            : []
  }

  function rewriteTextFile(filePath, lineTransform) {
    var newLines = readLines(filePath).map(lineTransform);
    fs.writeFileSync(filePath, newLines.join('\n'));
  }

  function findUpward(search) {
    search = [search];
    while (search.length < 32) {
      var searchPath = search.join(path.sep);
      if (exists(searchPath)) {
        return searchPath;
      }
      search = ['..'].concat(search);
    }
    return null;
  }

  module.exports = {
    findUpward: findUpward,
    rewriteTextFile: rewriteTextFile,
    readLines: readLines,
    flatten: flatten,
    ls: ls,
    lsR: lsR,
    copyFile: copyFile,
    rmdir: rmdir,
    exists: exists,
    fileExists: fileExists,
    folderExists: folderExists,
    isSymLink: isSymLink,
    ensureFolderExists: ensureFolderExists
  };
})();