/**
 * Wait for document.body to be available (needed when content scripts run at document_start).
 */
function ensureBody(): Promise<HTMLElement> {
  return new Promise((resolve) => {
    if (document.body) {
      resolve(document.body);
      return;
    }
    // Body not ready yet — wait for DOMContentLoaded
    const onReady = () => {
      document.removeEventListener('DOMContentLoaded', onReady);
      resolve(document.body);
    };
    document.addEventListener('DOMContentLoaded', onReady);
  });
}

export function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<Element | null> {
  return new Promise(async (resolve) => {
    // Check immediately
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    // Ensure body is available before observing
    const body = await ensureBody();

    // Check again after body is ready (element may have appeared)
    const elementAfterBody = document.querySelector(selector);
    if (elementAfterBody) {
      resolve(elementAfterBody);
      return;
    }

    const observer = new MutationObserver((_mutations, obs) => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });

    observer.observe(body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

export function waitForElements(
  selector: string,
  timeout: number = 5000
): Promise<NodeListOf<Element>> {
  return new Promise(async (resolve) => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      resolve(elements);
      return;
    }

    // Ensure body is available before observing
    const body = await ensureBody();

    // Check again after body is ready
    const elementsAfterBody = document.querySelectorAll(selector);
    if (elementsAfterBody.length > 0) {
      resolve(elementsAfterBody);
      return;
    }

    const observer = new MutationObserver((_mutations, obs) => {
      const els = document.querySelectorAll(selector);
      if (els.length > 0) {
        obs.disconnect();
        resolve(els);
      }
    });

    observer.observe(body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(document.querySelectorAll(selector));
    }, timeout);
  });
}
