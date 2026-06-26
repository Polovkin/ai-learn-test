import { initialPosition, modulus, multiplier, parties } from "./constants";
import { getNextPosition } from "./math";
import type { DhState, PartyId, PartyState, Phase } from "./types";

function createPartyState(): PartyState {
    return {
        publicPosition: initialPosition,
        publicSteps: 0,
        publicHistory: [initialPosition],
        publicFormula: "Стартує з 1",
        sharedPosition: null,
        sharedSteps: 0,
        sharedHistory: [],
        sharedFormula: "Чекає на публічне число іншої сторони",
    };
}

export function createInitialState(): DhState {
    return {
        parties: {
            alice: createPartyState(),
            bob: createPartyState(),
        },
    };
}

function cloneState(state: DhState): DhState {
    return {
        parties: {
            alice: {
                ...state.parties.alice,
                publicHistory: [...state.parties.alice.publicHistory],
                sharedHistory: [...state.parties.alice.sharedHistory],
            },
            bob: {
                ...state.parties.bob,
                publicHistory: [...state.parties.bob.publicHistory],
                sharedHistory: [...state.parties.bob.sharedHistory],
            },
        },
    };
}

function stepPosition(previous: number, factor: number): {
    current: number;
    formula: string;
} {
    const current = getNextPosition(previous, factor);

    return {
        current,
        formula: `(${previous} × ${factor}) % ${modulus} = ${current}`,
    };
}

export function canStepPublic(state: DhState, partyId: PartyId): boolean {
    return state.parties[partyId].publicSteps < parties[partyId].secretSteps;
}

export function canStepShared(state: DhState, partyId: PartyId): boolean {
    const party = state.parties[partyId];
    const otherPartyId = parties[partyId].sharedFromParty;
    const otherParty = state.parties[otherPartyId];

    return (
        otherParty.publicSteps === parties[otherPartyId].secretSteps
        && party.sharedSteps < parties[partyId].secretSteps
    );
}

export function stepParty(state: DhState, partyId: PartyId, phase: Phase): DhState {
    const nextState = cloneState(state);
    const party = nextState.parties[partyId];

    if (phase === "public") {
        if (!canStepPublic(state, partyId)) {
            return state;
        }

        const previous = party.publicPosition;
        const step = stepPosition(previous, multiplier);

        party.publicPosition = step.current;
        party.publicSteps += 1;
        party.publicHistory.push(step.current);
        party.publicFormula = step.formula;

        return nextState;
    }

    if (!canStepShared(state, partyId)) {
        return state;
    }

    const otherPartyId = parties[partyId].sharedFromParty;
    const otherPublicPosition = state.parties[otherPartyId].publicPosition;
    const previous = party.sharedPosition ?? initialPosition;
    const step = stepPosition(previous, otherPublicPosition);

    if (party.sharedHistory.length === 0) {
        party.sharedHistory.push(initialPosition);
    }

    party.sharedPosition = step.current;
    party.sharedSteps += 1;
    party.sharedHistory.push(step.current);
    party.sharedFormula = step.formula;

    return nextState;
}

export function getSharedMatch(state: DhState): boolean {
    const aliceShared = state.parties.alice.sharedPosition;
    const bobShared = state.parties.bob.sharedPosition;

    return (
        aliceShared !== null
        && bobShared !== null
        && state.parties.alice.sharedSteps === parties.alice.secretSteps
        && state.parties.bob.sharedSteps === parties.bob.secretSteps
        && aliceShared === bobShared
    );
}

export function getPartyProgress(state: DhState, partyId: PartyId): {
    publicDone: boolean;
    sharedDone: boolean;
} {
    return {
        publicDone: state.parties[partyId].publicSteps === parties[partyId].secretSteps,
        sharedDone: state.parties[partyId].sharedSteps === parties[partyId].secretSteps,
    };
}
