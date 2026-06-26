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
    secretSteps: Record<PartyId, number>;
    attacker: AttackerState;
};

export type DialTrace = {
    id: string;
    party: PartyId;
    phase: Phase;
    history: number[];
};

export type AttackerTargetResult = {
    party: PartyId;
    publicPosition: number;
    foundSteps: number | null;
    equivalentSteps: number[];
    attempts: number;
};

export type AttackerState = {
    calculatedAt: string | null;
    elapsedMs: number | null;
    results: Record<PartyId, AttackerTargetResult> | null;
};
