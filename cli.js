#!/usr/bin/env node
const fs = require('fs')
const minimisted = require('minimisted')
const git = require('isomorphic-git')
const credentialManager = require('@isomorphic-git/credential-manager-node-cli')
const _cliProgress = require('cli-progress')
const ora = require('ora')
let spinner = ora()

git.plugins.set('fs', fs)
git.plugins.set('credentialManager', credentialManager)

let prev = {
  phase: null
}
git.plugins.set('emitter', {
  emit (event, data) {
    try {
      if (event === 'progress') {
        // console.log(data.phase, data.loaded, '/', data.total)
        if (prev.phase !== data.phase) {
          if (prev.bar1) prev.bar1.stop()
          if (prev.spinner) prev.spinner.stopAndPersist()
          if (data.lengthComputable) {
            data.bar1 = new _cliProgress.Bar({
              format: `${data.phase} {bar} {percentage}% | {eta}s`
            }, _cliProgress.Presets.shades_classic);
            data.bar1.start(data.total, data.loaded)
          } else {
            spinner.text = data.phase
            spinner.start()
            data.spinner = spinner
          }
        } else if (data.lengthComputable) {
          data.bar1 = prev.bar1
          data.bar1.update(data.loaded)
        } else {
          data.spinner = prev.spinner
          data.spinner.text = `${data.phase} (${data.loaded})`
        }
        prev = data
      }
    } catch (err) {
      console.log(err)
    }
  }
})

minimisted(async function ({ _: [command, ...args], ...opts }) {
  try {
    let result = await git[command](Object.assign({ dir: '.' }, opts))
    if (prev.spinner) prev.spinner.stopAndPersist()
    if (prev.bar1) prev.bar1.stop()
    if (result === undefined) return
    console.log(JSON.stringify(result, null, 2))
  } catch (err) {
    process.stderr.write(err.message + '\n')
    console.log(err)
    process.exit(1)
  }
})
