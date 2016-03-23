#!/usr/bin/env node


'use strict';

var _ = require('lodash');
var async = require('async');
var child_process = require('child_process');

var repeat = 3;
var parallel = 3;

process.stdout.write('Fuck NPM!\n');

var concat = function concat(obj) {
  var deps = [];
  if (!obj) return deps;
  _.forEach(obj, function (val, k) {
    if (val.version) deps.push(k + '@' + val.version);
    deps = deps.concat(concat(val.dependencies));
  });
  return deps;
};

var checkAll = function checkAll(deps) {
  return async.parallelLimit(deps.map(checker), parallel, function (err, data) {
    if (err) return process.stderr.write(err);
    var failed = _.filter(data, function (dep) {
      return !dep[0];
    });
    if (failed.length > 0) {
      process.stderr.write('These deps have been unpublished:\n');
      process.stderr.write(JSON.stringify(failed.map(function (dep) {
        return dep[1];
      }), null, ' '));
      process.stderr.write('\n\nNPM has failed you!\n');
    } else {
      process.stdout.write('You\'re all good');
    }
  });
};

var checker = function checker(dep, r) {
  return function (cb) {
    var gotData = void 0;
    var info = child_process.spawn('npm', ['info', dep]);
    info.stdout.on('data', function () {
      gotData = true;
    });
    info.on('exit', function (code) {
      if (r < repeat + 1 && !gotData) checker(dep, (r || 0) + 1)(cb);
      cb(code, [gotData, dep]);
    });
  };
};

var output = '';
var lsCmd = child_process.spawn('npm', ['ls', '--json=true'], {});
lsCmd.stdout.on('data', function (data) {
  output += data.toString();
}).on('end', function () {
  return _(output).chain().thru(JSON.parse.bind(JSON)).thru(function (obj) {
    return obj.dependencies;
  }).thru(concat).thru(checkAll).value();
});
lsCmd.stderr.on('data', function (err) {
  return process.stdout.write(err);
});