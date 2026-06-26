import type { DomElements } from "./types";

function getRequiredElement<T extends Element>(selector: string, constructor: {
    new (...args: never[]): T;
}): T {
    const element = document.querySelector(selector);

    if (!(element instanceof constructor)) {
        throw new Error(`Missing required element: ${selector}`);
    }

    return element;
}

export function getDomElements(): DomElements {
    return {
        current: getRequiredElement("#current", HTMLElement),
        steps: getRequiredElement("#steps", HTMLElement),
        calculation: getRequiredElement("#calculation", HTMLElement),
        cycleStatus: getRequiredElement("#cycleStatus", HTMLElement),
        history: getRequiredElement("#history", HTMLOListElement),
        dial: getRequiredElement("#dial", SVGSVGElement),
        nextButton: getRequiredElement("#nextButton", HTMLButtonElement),
        resetButton: getRequiredElement("#resetButton", HTMLButtonElement),
    };
}
