#!/usr/bin/env node
(function() {
  'use strict';
  var
    ParaBot = require('./src/parabot'),
    ParaMerge = require('./src/paramerge'),
    utils = require('./src/utils'),
    path = require('path'),
    cli = require('cli').enable('glob'),
    rimraf = require('rimraf');

  cli.parse(ParaBot.options);

  function pad(v) {
    v = String(v);
    while (v.length < 2) {
      v = '0' + v;
    }
    return v;
  }

  function humanReadableTimeFor(ms) {
    var seconds = parseInt(ms / 1000);
    var minutes = parseInt(seconds / 60) % 60;
    seconds = seconds % 60;
    return 
  }

  cli.main(function (ignore, options) {
    var packageFile = utils.findUpward('package.json');
    var target = [path.dirname(packageFile), 'node_modules'].join('/');
    console.log('installing to: ' + target);
    var parabot = new ParaBot(options);
    parabot.install().then(function(sources) {
      var paramerge = new ParaMerge();
      return paramerge.merge(sources, target);
    }).then(function () {
      console.log('parabot complete!');
    }).catch(function (err) {
      console.log('ParaFAIL: ' + err);
    });
  });
})();