export type Point = {
    x: number;
    y: number;
};

export type TslState = {
    current: number;
    steps: number;
    history: number[];
    calculation: string;
};

export type DomElements = {
    current: HTMLElement;
    steps: HTMLElement;
    calculation: HTMLElement;
    cycleStatus: HTMLElement;
    history: HTMLOListElement;
    dial: SVGSVGElement;
    nextButton: HTMLButtonElement;
    resetButton: HTMLButtonElement;
};
