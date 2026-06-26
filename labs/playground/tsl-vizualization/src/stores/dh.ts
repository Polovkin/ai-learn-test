import { defineStore } from "pinia";
import {
    attackerSearchLimit,
    defaultSecretSteps,
    initialPosition,
    modulus,
    multiplier,
    parties,
} from "../ts/constants";
import { getNextPosition } from "../ts/math";
import type {
    AttackerState,
    DhState,
    PartyId,
    PartyState,
    Phase,
} from "../ts/types";

function createPartyState(): PartyState {
    return {
        publicPosition: initialPosition,
        publicSteps: 0,
        publicHistory: [initialPosition],
        publicFormula: "Стартова позиція: 1",
        sharedPosition: null,
        sharedSteps: 0,
        sharedHistory: [],
        sharedFormula: "Очікуємо публічне число іншої сторони",
    };
}

function createInitialParties(): DhState["parties"] {
    return {
        alice: createPartyState(),
        bob: createPartyState(),
    };
}

function createInitialAttacker(): AttackerState {
    return {
        calculatedAt: null,
        elapsedMs: null,
        results: null,
    };
}

function createInitialState(): DhState {
    return {
        parties: createInitialParties(),
        secretSteps: {
            alice: defaultSecretSteps.alice,
            bob: defaultSecretSteps.bob,
        },
        attacker: createInitialAttacker(),
    };
}

function normalizeSecretSteps(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.min(99, Math.trunc(value)));
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

function findEquivalentSteps(target: number): number[] {
    let position = initialPosition;
    const matches: number[] = [];

    for (let steps = 0; steps <= attackerSearchLimit; steps += 1) {
        if (position === target) {
            matches.push(steps);
        }

        position = getNextPosition(position, multiplier);
    }

    return matches;
}

export const useDhStore = defineStore("dh", {
    state: createInitialState,
    getters: {
        canStepPublic: (state) => (partyId: PartyId): boolean => (
            state.parties[partyId].publicSteps < state.secretSteps[partyId]
        ),
        canStepShared: (state) => (partyId: PartyId): boolean => {
            const party = state.parties[partyId];
            const otherPartyId = parties[partyId].sharedFromParty;
            const otherParty = state.parties[otherPartyId];

            return (
                otherParty.publicSteps === state.secretSteps[otherPartyId]
                && party.sharedSteps < state.secretSteps[partyId]
            );
        },
        sharedMatch: (state): boolean => {
            const aliceShared = state.parties.alice.sharedPosition;
            const bobShared = state.parties.bob.sharedPosition;

            return (
                aliceShared !== null
                && bobShared !== null
                && state.parties.alice.sharedSteps === state.secretSteps.alice
                && state.parties.bob.sharedSteps === state.secretSteps.bob
                && aliceShared === bobShared
            );
        },
        partyProgress: (state) => (partyId: PartyId): {
            publicDone: boolean;
            sharedDone: boolean;
        } => ({
            publicDone: state.parties[partyId].publicSteps === state.secretSteps[partyId],
            sharedDone: state.parties[partyId].sharedSteps === state.secretSteps[partyId],
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
                this.attacker = createInitialAttacker();

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
            this.attacker = createInitialAttacker();
        },
        setSecretSteps(partyId: PartyId, value: number): void {
            this.secretSteps[partyId] = normalizeSecretSteps(value);
            this.parties = createInitialParties();
            this.attacker = createInitialAttacker();
        },
        calculateAttacker(): void {
            const startedAt = performance.now();
            const aliceEquivalentSteps = findEquivalentSteps(this.parties.alice.publicPosition);
            const bobEquivalentSteps = findEquivalentSteps(this.parties.bob.publicPosition);
            const elapsedMs = performance.now() - startedAt;

            this.attacker = {
                calculatedAt: new Date().toLocaleTimeString("uk-UA"),
                elapsedMs,
                results: {
                    alice: {
                        party: "alice",
                        publicPosition: this.parties.alice.publicPosition,
                        foundSteps: aliceEquivalentSteps[0] ?? null,
                        equivalentSteps: aliceEquivalentSteps,
                        attempts: attackerSearchLimit + 1,
                    },
                    bob: {
                        party: "bob",
                        publicPosition: this.parties.bob.publicPosition,
                        foundSteps: bobEquivalentSteps[0] ?? null,
                        equivalentSteps: bobEquivalentSteps,
                        attempts: attackerSearchLimit + 1,
                    },
                },
            };
        },
        reset(): void {
            this.parties = createInitialParties();
            this.attacker = createInitialAttacker();
        },
    },
});
