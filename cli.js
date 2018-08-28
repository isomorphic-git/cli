#!/usr/bin/env node
const fs = require('fs')
const minimisted = require('minimisted')
const git = require('isomorphic-git')
const credentialManager = require('@isomorphic-git/credential-manager-node-cli')

git.plugins.set('fs', fs)
git.plugins.set('credentialManager', credentialManager)

minimisted(async function ({ _: [command, ...args], ...opts }) {
  try {
    let result = await git[command](Object.assign({ dir: '.' }, opts))
    if (result === undefined) return
    console.log(JSON.stringify(result, null, 2))
  } catch (err) {
    process.stderr.write(err.message + '\n')
    console.log(err)
    process.exit(1)
  }
})
