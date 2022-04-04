const fs = require('fs');
const parseStep = require('./parse.js').parseStep;

function transformFile(file, output) {
  const INPUTFILE = file;
  const OUTFILE = output;
  const TPLFILE = './template.js'
  const OUTPUTSTEPNAME = 'output'
  
  let steps = parseStep(INPUTFILE);
  
  let conf = steps.map((step, i) => 'step'+ i)
  
  // output last step target ele innerText
  conf[conf.length - 1] = OUTPUTSTEPNAME
  
  const stepFuncs = steps.map((step, i) => {
    return createFunc(step.detail, conf[i])
  })
  
  const template = fs.readFileSync(TPLFILE, {
    encoding: 'utf-8'
  })
  
  const newFileContent = `
${template}
caller([${stepFuncs}])
`
  
  fs.writeFileSync(OUTFILE, newFileContent)
}

function createFunc(str, name) {
  return `
async function ${name}(page) {
  ${str}
  if (element) return element.innerText
}
`
}

module.exports = { 
  transformFile
}