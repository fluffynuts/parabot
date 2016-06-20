(function() {
  'use strict';
  var
    path = require('path'),
    fs = require('fs'),
    process = require('process'),
    utils = require('./utils'),
    Queue = require('childprocess-queue').newQueue;
  function ParaBot(opts) {
    this._options = opts || {};
  }
  var DEFAULT_CONCURRENT_JOBS = 10;

  ParaBot.prototype = {
    _readPackageContents: function() {
      var packageFile = utils.findUpward('package.json');
      return packageFile ? fs.readFileSync(packageFile) : null;
    },
    _findAllRequiredPackages: function() {
      var
        cwd = process.cwd(),
        packageFile = this._readPackageContents();
      if (!packageFile) {
        throw new Error('Unable to find package file, travelling up from ' + cwd);
      }
      var config = JSON.parse(packageFile);
      var merged = Object.assign({}, config.devDependencies, config.dependencies);
      var packageFor = function(k) {
        var result = {};
        result[k] = merged[k];
        return result;
      };
      return Object.keys(merged).map(packageFor);
    },
    _execOptions: {
      onCreate: function(child) {
        var cmd = child.spawnargs.filter(function(a) {
          return a.indexOf('@') > -1;
        })[0]
        var packageName = (cmd || '').split(' ').filter(function(a) {
          return a.indexOf('@') > -1;
        });
        console.log('installing: ' + packageName);
      }
    },
    _createQueue: function(packageCount) {
      var queue = new Queue();
      var jobs = this._options.jobs || DEFAULT_CONCURRENT_JOBS;
      if (jobs === 'all') {
        console.log('crazy mode enabled! attempting ' + packageCount + ' simultaneous installs');
        jobs = packageCount
      } else {
        jobs = parseInt(jobs);
        if (isNaN(jobs)) {
          console.log('"' + this._options.jobs + '" should be an integer or the magic word "all"');
          jobs = DEFAULT_CONCURRENT_JOBS
        }
      }
      console.log('running ' + jobs + ' concurrent installs');
      queue.setMaxProcesses(jobs);
      return queue;
    },
    _getTempFolderName: function(k) {
      var idx = 0;
      while (fs.existsSync('.parabot-' + idx + '-' + k)) {
        idx++;
      }
      return '.parabot-' + idx + '-' + k;
    },
    install: function() {
      var 
        packages = this._findAllRequiredPackages(),
        queue = this._createQueue(packages.length),
        opts = this._execOptions,
        children = [];
      var self = this;
      var folders = [];
      packages.forEach(function(p) {
        var k = Object.keys(p)[0];
        var v = p[k];
        var folder = self._getTempFolderName(k);
        folders.push(folder)
        var child = queue.exec(
          [
            'npm install ', k, '@', v,
            ' --prefix ', folder].join(''), 
          opts);
      });
      return new Promise(function(resolve, reject) {
        var waited = 0;
        setTimeout(function check() {
          var pending = queue.getCurrentProcessCount();
          if (pending) {
            // if (waited++ > 100) {
            //   var args = queue.getCurrentProcesses().map(function(p) {
            //     return p.spawnargs[p.spawnargs.length-1];
            //   });
            //   console.log(args);
            // }
            setTimeout(check, 100);
          } else {
            resolve(folders);
          }
        }, 100);
      });
    }
  };
  ParaBot.options = {
    'jobs': ['j', 'Max concurrent jobs (default ' + DEFAULT_CONCURRENT_JOBS + ')', 'string']
  };
  module.exports = ParaBot;
})();