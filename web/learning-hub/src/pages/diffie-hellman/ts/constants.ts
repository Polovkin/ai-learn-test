export const modulus = 23;
export const multiplier = 5;
export const initialPosition = 1;

export const parties = {
    alice: {
        name: "Аліса",
        sharedFromParty: "bob",
    },
    bob: {
        name: "Коля",
        sharedFromParty: "alice",
    },
} as const;

export const defaultSecretSteps = {
    alice: 6,
    bob: 15,
} as const;

export const attackerSearchLimit = 99;

export const dialConfig = {
    center: 260,
    radius: 205,
    pointRadius: 15,
} as const;
