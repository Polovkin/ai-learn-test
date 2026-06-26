export const modulus = 23;
export const multiplier = 5;
export const initialPosition = 1;

export const parties = {
    alice: {
        name: "Аліса",
        secretSteps: 6,
        publicFrom: initialPosition,
        sharedFromParty: "bob",
    },
    bob: {
        name: "Коля",
        secretSteps: 15,
        publicFrom: initialPosition,
        sharedFromParty: "alice",
    },
} as const;

export const dialConfig = {
    center: 260,
    radius: 205,
    pointRadius: 15,
} as const;
