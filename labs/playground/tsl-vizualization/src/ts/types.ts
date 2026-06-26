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

export type DialTrace = {
    id: string;
    party: PartyId;
    phase: Phase;
    history: number[];
};
