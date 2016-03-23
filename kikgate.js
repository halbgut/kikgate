#!/usr/bin/env node

'use strict'

const _ = require('lodash')
const async = require('async')
const child_process = require('child_process')

const repeat = 3
const parallel = 3

process.stdout.write('Fuck NPM!\n')

const concat = (obj) => {
  let deps = []
  if (!obj) return deps
  _.forEach(obj, (val, k) => {
    if (val.version) deps.push(`${k}@${val.version}`)
    deps = deps.concat(concat(val.dependencies))
  })
  return deps
}

const checkAll = (deps) =>
  async.parallelLimit(deps.map(checker), parallel, (err, data) => {
    if (err) return process.stderr.write(err)
    const failed = _.filter(data, (dep) => !dep[0])
    if (failed.length > 0) {
      process.stderr.write('These deps have been unpublished:\n')
      process.stderr.write(JSON.stringify(
        failed.map((dep) => dep[1]),
        null,
        ' '
      ))
      process.stderr.write('\n\nNPM has failed you!\n')
    } else {
      process.stdout.write('You\'re all good')
    }
  })

const checker = (dep, r) => (cb) => {
  let gotData
  const info = child_process.spawn('npm', ['info', dep])
  info.stdout.on('data', () => { gotData = true })
  info
    .on('exit', (code) => {
      if (r < repeat + 1 && !gotData) checker(dep, (r || 0) + 1)(cb)
      cb(code, [gotData, dep])
    })
}

var output = ''
const lsCmd = child_process.spawn('npm', ['ls', '--json=true'], {})
lsCmd.stdout
  .on('data', (data) => { output += data.toString() })
  .on('end', () =>
    _(output)
      .chain()
      .thru(JSON.parse.bind(JSON))
      .thru((obj) => obj.dependencies)
      .thru(concat)
      .thru(checkAll)
      .value()
  )
lsCmd.stderr
  .on('data', (err) => process.stdout.write(err))

