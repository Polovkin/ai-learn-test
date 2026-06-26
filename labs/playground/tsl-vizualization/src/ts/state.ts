import { initialPosition, modulus, multiplier } from "./constants";
import { getNextPosition } from "./math";
import type { TslState } from "./types";

export function createInitialState(): TslState {
    return {
        current: initialPosition,
        steps: 0,
        history: [initialPosition],
        calculation: "Старт",
    };
}

export function stepState(state: TslState): TslState {
    const previous = state.current;
    const current = getNextPosition(previous);
    const steps = state.steps + 1;

    return {
        current,
        steps,
        history: [...state.history, current],
        calculation: `(${previous} × ${multiplier}) % ${modulus} = ${current}`,
    };
}
