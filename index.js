const fork = require('child_process').fork;
const path = require('path');
const fs = require('fs');
const { transformFile } = require('./transform');
// config
const CONFIGTIMESPAN = require('./config.json').timespan || 30 * 60 * 1000;
// input
const RECORDERFILE = './demo/xiecheng.js';
const TIMESPAN = 30 * 60 * 1000;
const UNTIL = '2022/5/31'; // time or timestamp
// input && config
const recorderFile = path.resolve(process.cwd(), RECORDERFILE);
const timespan = TIMESPAN || CONFIGTIMESPAN;
const timestamp = new Date(UNTIL).getTime();

if (!fs.existsSync(recorderFile)) {
  console.log(`${RECORDERFILE} is not exist`)
  process.exit(1);
}

if (isNaN(timestamp)) {
  console.log('Invalid Date. Please input valid Date. Eg: 2022/3/31 10:10:10');
  
  process.exit(1);
}

// transform file
const fileName = 'time-' + new Date().getTime() + '.js';
const transformedFile = path.resolve(__dirname, fileName);

console.log('transform file...')
transformFile(recorderFile, transformedFile)
console.log(`file transformed > ${fileName}`)

fork(transformedFile);

const timer = setInterval(() => {
  if (new Date().getTime() > timestamp) {
    clearInterval(timer);
    fs.rmSync(transformedFile);
    exit(0)
  }

  fork(transformedFile);
}, timespan);