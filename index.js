#!/usr/bin/env node
'use strict'

const parse = require('get-them-args')
const commandExists = require('command-exists')
const sh = require('shell-exec')

const args = parse(process.argv)

async function commandsExist () {
  console.log('Checking if commands exist')
  try {
    await commandExists('watchman')
    console.log('watchman exists ✔')

    if (args.yarn) {
      await commandExists('yarn')
      console.log('yarn exists ✔')
    } else {
      await commandExists('npm')
      console.log('yarn exists ✔')
    }
  } catch (error) {
    throw new Error(error)
  }
}

commandsExist()
  .then(runCommand)
  .catch(console.error)

function runCommand () {
  const packager = args.yarn ? 'yarn' : 'npm'
  const reset = `watchman watch-del-all && rm -rf $TMPDIR/react-* && rm -rf node_modules && ${packager} install`
  const cleanCache = `&& ${packager} cache clean${args.yarn ? '' : ' --force'}`
  const start = args.start ? `&& ${packager} start --reset-cache` : ''
  const android = args.android ? '&& cd android & gradlew clean & cd ..' : ''
  const cmd = `${reset} ${cleanCache} ${android} ${start}`
  console.log(`Running command: ${cmd}`)
  return sh(cmd).catch(console.error)
}

process.on('SIGTERM', function () {
  process.exit()
})