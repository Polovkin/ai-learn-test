import type { DomElements, PartyDomElements } from "./types";

function getRequiredElement<T extends Element>(selector: string, constructor: {
    new (...args: never[]): T;
}): T {
    const element = document.querySelector(selector);

    if (!(element instanceof constructor)) {
        throw new Error(`Missing required element: ${selector}`);
    }

    return element;
}

function getPartyElements(partyId: "alice" | "bob"): PartyDomElements {
    return {
        publicSteps: getRequiredElement(`#${partyId}PublicSteps`, HTMLElement),
        publicPosition: getRequiredElement(`#${partyId}PublicPosition`, HTMLElement),
        publicFormula: getRequiredElement(`#${partyId}PublicFormula`, HTMLElement),
        publicButton: getRequiredElement(`#${partyId}PublicButton`, HTMLButtonElement),
        sharedSteps: getRequiredElement(`#${partyId}SharedSteps`, HTMLElement),
        sharedPosition: getRequiredElement(`#${partyId}SharedPosition`, HTMLElement),
        sharedFormula: getRequiredElement(`#${partyId}SharedFormula`, HTMLElement),
        sharedButton: getRequiredElement(`#${partyId}SharedButton`, HTMLButtonElement),
        sharedKey: getRequiredElement(`#${partyId}SharedKey`, HTMLElement),
        history: getRequiredElement(`#${partyId}History`, HTMLOListElement),
    };
}

export function getDomElements(): DomElements {
    return {
        dial: getRequiredElement("#dial", SVGSVGElement),
        sharedStatus: getRequiredElement("#sharedStatus", HTMLElement),
        alice: getPartyElements("alice"),
        bob: getPartyElements("bob"),
        resetButton: getRequiredElement("#resetButton", HTMLButtonElement),
    };
}
