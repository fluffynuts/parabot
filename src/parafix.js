(function() {
  var
    fs = require('fs'),
    path = require('path'),
    utils = require('./utils');
  // fix binaries which are confuzzled by the folder-per-package way that parabot works
  var
    shellRegEx = /\$basedir\/node_modules\//,
    shellReplace = '$basedir/../',
    cmdRegEx = /%~dp0\\node_modules\\/,
    cmdReplace = '%~dp0\\..\\';
  

  function fixShellScript(f) {
    utils.rewriteTextFile(f, function(l) {
      return l.replace(shellRegEx, shellReplace);
    });
  }
  
  function fixBatchFile(f) {
    utils.rewriteTextFile(f, function(l) {
      return l.replace(cmdRegEx, cmdReplace);
    });
  }

  function ParaFix() {
  }
  var transforms = {
    '.cmd': fixBatchFile,
    '': fixShellScript
  }

  ParaFix.prototype = {
    fix: function(binPath) {
      var files = utils.ls(binPath).filter(function(entry) {
        return utils.fileExists(entry) && !utils.isSymLink(entry);
      });
      var self = this;
      files.forEach(function(f) {
        var transform = transforms[path.extname(f).toLowerCase()];
        if (transform) {
          transform(f);
        }
      });
    }
  };
  module.exports = ParaFix;
})();