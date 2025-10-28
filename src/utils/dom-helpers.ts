/**
 * Generate a unique CSS selector for an element
 */
export function getElementSelector(element: HTMLElement): string {
  // If element has an ID, use it
  if (element.id) {
    return `#${element.id}`;
  }

  // Try to build a selector using class names
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).filter(c => c);
    if (classes.length > 0) {
      const classSelector = '.' + classes.join('.');
      // Check if this selector is unique
      const matches = document.querySelectorAll(classSelector);
      if (matches.length === 1) {
        return classSelector;
      }
    }
  }

  // Build path using tag names and nth-child
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    }

    // Add nth-child if there are siblings of the same type
    const parent: HTMLElement | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child: Element) => child.tagName === current!.tagName
      );
      
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    path.unshift(selector);
    current = parent;
  }

  return path.join(' > ');
}

/**
 * Get an element by selector (CSS or XPath)
 */
export function getElementBySelector(selector: string): HTMLElement | null {
  try {
    // Try CSS selector first
    return document.querySelector(selector);
  } catch {
    // If CSS fails, try XPath
    try {
      const result = document.evaluate(
        selector,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue as HTMLElement;
    } catch {
      return null;
    }
  }
}

/**
 * Simulate a click on an element
 */
export function clickElement(element: HTMLElement): void {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  element.dispatchEvent(event);
}

/**
 * Set text value of an input element
 */
export function setInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  element.value = value;
  
  // Trigger input and change events
  const inputEvent = new Event('input', { bubbles: true });
  const changeEvent = new Event('change', { bubbles: true });
  
  element.dispatchEvent(inputEvent);
  element.dispatchEvent(changeEvent);
}

/**
 * Scroll to specific coordinates
 */
export function scrollToPosition(x: number, y: number): void {
  window.scrollTo(x, y);
}

/**
 * Wait for a specified duration
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
