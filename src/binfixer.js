(function() {
  var
    fs = require('fs'),
    utils = require('./utils');
  // fix binaries which are confuzzled by the folder-per-package way that parabot works
  function trim(s) {
    return s.trim();
  }
  function BinFixer() {
  }
  BinFixer.prototype = {
    fix: function(binPath) {
      var files = fs.readdirSync(binPath).filter(function(p) {
        return utils.fileExists([binPath, p].join('/'));
      });
      files.forEach(function(f) {
        f = [binPath, f].join('/');
        var lines = fs.readFileSync(f).toString().split('\n').map(trim);
        var newLines = lines.map(function(l) {
          console.log('line: ' + l);
          if (l.indexOf('basedir') > -1) {
            console.log(l);
          }
          return l.replace(/\$basedir\/node_modules\//, '$basedir/../'); 
        });
        fs.writeFileSync([binPath, f].join('/'), newLines.join('\n'));
      });
    }
  };
  module.exports = BinFixer;
})();