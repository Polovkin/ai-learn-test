import { dialConfig, modulus, multiplier } from "./constants";
import type { Point } from "./types";

export function getNextPosition(current: number): number {
    return (current * multiplier) % modulus;
}

export function getDialPoint(value: number): Point {
    const angle = (value / modulus) * Math.PI * 2 - Math.PI / 2;

    return {
        x: dialConfig.center + Math.cos(angle) * dialConfig.radius,
        y: dialConfig.center + Math.sin(angle) * dialConfig.radius,
    };
}
