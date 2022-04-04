const fs = require('fs');

function parseStep(filePath) {
  let content = fs.readFileSync(filePath, {
    encoding: 'utf-8'
  });

  const sign = "throw new Error('Timed out');"
  let start = content.indexOf(sign);
  content = content.slice(start);

  return getBlock(content);
}

function getBlock(str) {
  const start = '{';
  const end = '}';
  let block = [];
  let blockNow = null;

  for(let i = 0; i < str.length; i++) {
    if (str[i] === start) {
      if (blockNow) {
        let child = {
          father: blockNow,
          children: [],
          start: i,
          end: NaN
        }

        blockNow.children.push(child);
        blockNow = child;
      } else {
        blockNow = {
          father: undefined,
          children: [],
          start: i,
          end: NaN,
          detail: ''
        }

        block.push(blockNow)
      }

      continue;
    }

    if (str[i] === end) {
      if (!blockNow) continue;

      blockNow.end = i;

      if (!blockNow.father) {
        blockNow.detail = str.slice(blockNow.start + 1, i)
      }

      blockNow = blockNow.father;
    }
  }

  return block
}

module.exports = {
  parseStep
}