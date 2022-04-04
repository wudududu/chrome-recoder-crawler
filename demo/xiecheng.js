const puppeteer = require('puppeteer'); // v13.0.0 or later

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const timeout = 5000;
    page.setDefaultTimeout(timeout);

    async function waitForSelectors(selectors, frame, options) {
      for (const selector of selectors) {
        try {
          return await waitForSelector(selector, frame, options);
        } catch (err) {
          console.error(err);
        }
      }
      throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
    }

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

    async function waitForSelector(selector, frame, options) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to waitForSelector');
      }
      let element = null;
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (element) {
          element = await element.waitForSelector(part, options);
        } else {
          element = await frame.waitForSelector(part, options);
        }
        if (!element) {
          throw new Error('Could not find element: ' + selector.join('>>'));
        }
        if (i < selector.length - 1) {
          element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        }
      }
      if (!element) {
        throw new Error('Could not find element: ' + selector.join('|'));
      }
      return element;
    }

    async function waitForElement(step, frame, timeout) {
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
      }, timeout);
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
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to querySelectorAll');
      }
      let elements = [];
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
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
        if (i < selector.length - 1) {
          const tmpElements = [];
          for (const el of elements) {
            const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
            if (newEl) {
              tmpElements.push(newEl);
            }
          }
          elements = tmpElements;
        }
      }
      return elements;
    }

    async function waitForFunction(fn, timeout) {
      let isActive = true;
      setTimeout(() => {
        isActive = false;
      }, timeout);
      while (isActive) {
        const result = await fn();
        if (result) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error('Timed out');
    }
    {
        const targetPage = page;
        await targetPage.setViewport({"width":885,"height":796})
    }
    {
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        await targetPage.goto('https://flights.ctrip.com/online/list/oneway-SZX-CTU?_=1&depdate=2022-05-31');
        await Promise.all(promises);
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["aria/确认"],["#outerContainer > div > div.alert-footer > div > button"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 236.5, y: 13.6015625} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#hp_container > div.app-page-container > div > div.body-wrapper > div.topbar-v2-root > div > ul.filterbar-v2 > li:nth-child(1) > div > span > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 9, y: 5} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#filter_item_airline > div"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 37.546875, y: 17} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#filter_group_airline__airline > li:nth-child(5) > span > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 8.546875, y: 4} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#filter_item_airline > div.filter-options.col-1 > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 13.546875, y: 19} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#filter_item_time > div"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 63.546875, y: 23} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#filter_group_time__arrive > li:nth-child(4) > span > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 11.546875, y: 3} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#filter_item_time > div.filter-options.col-2 > i"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 14.546875, y: 14} });
    }
    {
        const targetPage = page;
        const element = await waitForSelectors([["#hp_container > div.app-page-container > div > div.body-wrapper > div.result-wrapper > div.flight-list.root-flights > span > div:nth-child(1) > div > div > div > div > div.flight-operate > div.flight-price > div > div.price.over-size > span.price"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await element.click({ offset: { x: 35.0625, y: 20.546875} });
    }

    await browser.close();
})();
