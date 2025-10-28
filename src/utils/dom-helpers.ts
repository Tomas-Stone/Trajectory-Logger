export function getElement(selector: string): HTMLElement | null {
    return document.querySelector(selector);
}

export function getElements(selector: string): NodeListOf<HTMLElement> {
    return document.querySelectorAll(selector);
}

export function createElement(tag: string, className?: string, innerHTML?: string): HTMLElement {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (innerHTML) {
        element.innerHTML = innerHTML;
    }
    return element;
}

export function appendChild(parent: HTMLElement, child: HTMLElement): void {
    parent.appendChild(child);
}

export function removeElement(element: HTMLElement): void {
    if (element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

export function setElementText(element: HTMLElement, text: string): void {
    element.textContent = text;
}

export function setElementAttribute(element: HTMLElement, attribute: string, value: string): void {
    element.setAttribute(attribute, value);
}

export function getElementById(id: string): HTMLElement | null {
    return document.getElementById(id);
}