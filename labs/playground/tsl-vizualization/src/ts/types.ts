export type Point = {
    x: number;
    y: number;
};

export type PartyId = "alice" | "bob";

export type Phase = "public" | "shared";

export type PartyState = {
    publicPosition: number;
    publicSteps: number;
    publicHistory: number[];
    publicFormula: string;
    sharedPosition: number | null;
    sharedSteps: number;
    sharedHistory: number[];
    sharedFormula: string;
};

export type DhState = {
    parties: Record<PartyId, PartyState>;
};

export type PartyDomElements = {
    publicSteps: HTMLElement;
    publicPosition: HTMLElement;
    publicFormula: HTMLElement;
    publicButton: HTMLButtonElement;
    sharedSteps: HTMLElement;
    sharedPosition: HTMLElement;
    sharedFormula: HTMLElement;
    sharedButton: HTMLButtonElement;
    sharedKey: HTMLElement;
    history: HTMLOListElement;
};

export type DialTrace = {
    id: string;
    party: PartyId;
    phase: Phase;
    history: number[];
};

export type DomElements = {
    dial: SVGSVGElement;
    sharedStatus: HTMLElement;
    alice: PartyDomElements;
    bob: PartyDomElements;
    resetButton: HTMLButtonElement;
};
