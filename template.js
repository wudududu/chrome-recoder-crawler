const puppeteer = require('puppeteer');
const sendMsg = require('./email').sendMsg;
const isSelectorValid = require('./check-css-selector-isValid');
const element = null;
const timeout = 5000;

process.on('unhandledRejection', (reason) => {
  console.log('unhandledRejection', '\n' + reason)
  sendMsg({
    unhandledRejection: reason
  })

  process.exit(1)
})
process.on('uncaughtException', (error) => {
  console.log('uncaughtException', error)
  sendMsg({
    uncaughtException: error
  })

  process.exit(1)
})

async function scrollIntoViewIfNeeded(element, timeout) {
  await waitForConnected(element, timeout);
  const isInViewport = await element.isIntersectingViewport({threshold: 0});
  if (isInViewport) {
    return;
  }
  await element.evaluate(element => {
    element.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'auto',
    });
  });
  await waitForInViewport(element, timeout);
}

async function waitForConnected(element, timeout) {
  await waitForFunction(async () => {
    return await element.getProperty('isConnected');
  }, timeout);
}

async function waitForInViewport(element, timeout) {
  await waitForFunction(async () => {
    return await element.isIntersectingViewport({threshold: 0});
  }, timeout);
}

async function waitForSelectors(selectors, frame) {
  for (const selector of selectors) {
    try {
      if (!isSelectorValid(selector)) continue;

      return await waitForSelector(selector, frame);
    } catch(err) {
      const ts = +new Date();
      await frame.screenshot({path: 'err-pic-' + ts + '.png'})
      throw(err)
    }
  }
  throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
}

async function waitForSelector(selector, frame) {
  if (selector instanceof Array) {
    let element = null;
    for (const part of selector) {
      if (!element) {
        element = await frame.waitForSelector(part, { timeout: 60000 });
      } else {
        element = await element.$(part);
      }
      if (!element) {
        throw new Error('Could not find element: ' + part);
      }
      element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
    }
    if (!element) {
      throw new Error('Could not find element: ' + selector.join('|'));
    }

    let txt = await frame.evaluate((selector) => {
      return document.querySelector(selector.slice(-1)[0]).innerText
    }, selector)

    element.innerText = txt;

    return element;
  }
  const element = await frame.waitForSelector(selector, { timeout: 60000 });
  if (!element) {
    throw new Error('Could not find element: ' + selector);
  }

  let txt = await frame.evaluate((selector) => {
    return document.querySelector(selector).innerText
  }, selector)

  element.innerText = txt;
  return element;
}

async function waitForElement(step, frame) {
  const count = step.count || 1;
  const operator = step.operator || '>=';
  const comp = {
    '==': (a, b) => a === b,
    '>=': (a, b) => a >= b,
    '<=': (a, b) => a <= b,
  };
  const compFn = comp[operator];
  await waitForFunction(async () => {
    const elements = await querySelectorsAll(step.selectors, frame);
    return compFn(elements.length, count);
  });
}

async function querySelectorsAll(selectors, frame) {
  for (const selector of selectors) {
    const result = await querySelectorAll(selector, frame);
    if (result.length) {
      return result;
    }
  }
  return [];
}

async function querySelectorAll(selector, frame) {
  if (selector instanceof Array) {
    let elements = [];
    let i = 0;
    for (const part of selector) {
      if (i === 0) {
        elements = await frame.$$(part);
      } else {
        const tmpElements = elements;
        elements = [];
        for (const el of tmpElements) {
          elements.push(...(await el.$$(part)));
        }
      }
      if (elements.length === 0) {
        return [];
      }
      const tmpElements = [];
      for (const el of elements) {
        const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        if (newEl) {
          tmpElements.push(newEl);
        }
      }
      elements = tmpElements;
      i++;
    }
    return elements;
  }
  const element = await frame.$$(selector);
  if (!element) {
    throw new Error('Could not find element: ' + selector);
  }
  return element;
}

async function waitForFunction(fn) {
  let isActive = true;
  setTimeout(() => {
    isActive = false;
  }, 5000);
  while (isActive) {
    const result = await fn();
    if (result) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Timed out');
}

async function caller(steps) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(timeout);

  await new Promise((res) => {
   setTimeout(async() => {
     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36')
     res(1)
   }, 2000) 
  })

  let msgMap = {}; // step 内部使用
  const reg = /^(step)(\d+)$/;

  for (let step of steps) {
    // add log
    console.log(new Date().toLocaleString() + ':' + step.name)

    let v = await step(page)

    if (reg.test(step.name)) continue

    msgMap[step.name] = v
  }

  await browser.close();

  sendMsg(msgMap)
}