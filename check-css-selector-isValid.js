const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { document } = (new JSDOM('')).window;

const queryCheck = s => document.createDocumentFragment().querySelector(s)

const isSelectorValid = selector => {
  try { queryCheck(selector) } catch { return false }
  return true
}

module.exports = isSelectorValid