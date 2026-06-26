import { defineStore } from "pinia";
import { initialPosition, modulus, multiplier, parties } from "../ts/constants";
import { getNextPosition } from "../ts/math";
import type { DhState, PartyId, PartyState, Phase } from "../ts/types";

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

function createInitialState(): DhState {
    return {
        parties: {
            alice: createPartyState(),
            bob: createPartyState(),
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

export const useDhStore = defineStore("dh", {
    state: createInitialState,
    getters: {
        canStepPublic: (state) => (partyId: PartyId): boolean => (
            state.parties[partyId].publicSteps < parties[partyId].secretSteps
        ),
        canStepShared: (state) => (partyId: PartyId): boolean => {
            const party = state.parties[partyId];
            const otherPartyId = parties[partyId].sharedFromParty;
            const otherParty = state.parties[otherPartyId];

            return (
                otherParty.publicSteps === parties[otherPartyId].secretSteps
                && party.sharedSteps < parties[partyId].secretSteps
            );
        },
        sharedMatch: (state): boolean => {
            const aliceShared = state.parties.alice.sharedPosition;
            const bobShared = state.parties.bob.sharedPosition;

            return (
                aliceShared !== null
                && bobShared !== null
                && state.parties.alice.sharedSteps === parties.alice.secretSteps
                && state.parties.bob.sharedSteps === parties.bob.secretSteps
                && aliceShared === bobShared
            );
        },
        partyProgress: (state) => (partyId: PartyId): {
            publicDone: boolean;
            sharedDone: boolean;
        } => ({
            publicDone: state.parties[partyId].publicSteps === parties[partyId].secretSteps,
            sharedDone: state.parties[partyId].sharedSteps === parties[partyId].secretSteps,
        }),
    },
    actions: {
        stepParty(partyId: PartyId, phase: Phase): void {
            const party = this.parties[partyId];

            if (phase === "public") {
                if (!this.canStepPublic(partyId)) {
                    return;
                }

                const previous = party.publicPosition;
                const step = stepPosition(previous, multiplier);

                party.publicPosition = step.current;
                party.publicSteps += 1;
                party.publicHistory.push(step.current);
                party.publicFormula = step.formula;

                return;
            }

            if (!this.canStepShared(partyId)) {
                return;
            }

            const otherPartyId = parties[partyId].sharedFromParty;
            const otherPublicPosition = this.parties[otherPartyId].publicPosition;
            const previous = party.sharedPosition ?? initialPosition;
            const step = stepPosition(previous, otherPublicPosition);

            if (party.sharedHistory.length === 0) {
                party.sharedHistory.push(initialPosition);
            }

            party.sharedPosition = step.current;
            party.sharedSteps += 1;
            party.sharedHistory.push(step.current);
            party.sharedFormula = step.formula;
        },
        reset(): void {
            this.$patch(createInitialState());
        },
    },
});
