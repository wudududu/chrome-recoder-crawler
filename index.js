'use strict'

const fork = require('child_process').fork;
const { exit } = require('process');
const path = require('path');
const fs = require('fs');
const watch = require('node-watch');
const { transformFile } = require('./transform');

const argv = process.argv[2];

switch (argv) {
  case '-h':
  case '--help':
    console.log(`
Usage: node index.js ./config.json
`)
  exit(0);
  default:
    main(argv)
}

function main(configPath) {
  // config
  const CONFIGPATH = path.resolve(process.cwd(), configPath);
  const CONFIG = require(CONFIGPATH);
  const CONFIGTIMESPAN = CONFIG.timespan || 30 * 60 * 1000;
  // input
  const RECORDERFILE = CONFIG.recoderFile;
  const UNTIL = CONFIG.until;
  // input && config
  const recorderFile = path.resolve(path.dirname(CONFIGPATH), RECORDERFILE);
  const timespan = CONFIGTIMESPAN;
  const timestamp = new Date(UNTIL).getTime();

  if (!fs.existsSync(recorderFile)) {
    console.log(`${RECORDERFILE} is not exist`)
    process.exit(1);
  }

  if (isNaN(timestamp)) {
    console.log(`Invalid Date ${CONFIG.until}. Please input valid Date. Eg: 2022/3/31 10:10:10`);
    
    process.exit(1);
  }

  // transform file
  const fileName = 'time-' + new Date().getTime() + '.js';
  const transformedFile = path.resolve(__dirname, fileName);

  console.log('transform file...')
  transformFile(recorderFile, transformedFile)
  console.log(`file transformed > ${fileName}`)

  // watch
  watch(transformedFile, {}, function(evt, name) {
    if (evt === 'update') {
      console.log('%s changed.', name);
      fork(transformedFile, [CONFIGPATH]);
    }
  });

  const timer = setInterval(() => {
    if (new Date().getTime() > timestamp) {
      clearInterval(timer);
      fs.rmSync(transformedFile);
      exit(0)
    }

    fork(transformedFile, [CONFIGPATH]);
  }, timespan);
}