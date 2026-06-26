<script setup lang="ts">
import { computed } from "vue";
import { useDhStore } from "../stores/dh";
import { dialConfig, modulus } from "../ts/constants";
import { getDialPoint } from "../ts/math";
import type { DialTrace, PartyId, Phase } from "../ts/types";

const dhStore = useDhStore();
const partyIds: PartyId[] = ["alice", "bob"];
const values = Array.from({ length: modulus }, (_, value) => value);

function createTraceId(partyId: PartyId, phase: Phase): string {
    return `${partyId}-${phase}`;
}

const traces = computed<DialTrace[]>(() => (
    partyIds.flatMap((partyId) => {
        const party = dhStore.parties[partyId];

        return [
            {
                id: createTraceId(partyId, "public"),
                party: partyId,
                phase: "public",
                history: party.publicHistory,
            },
            {
                id: createTraceId(partyId, "shared"),
                party: partyId,
                phase: "shared",
                history: party.sharedHistory,
            },
        ];
    })
));

const visitedValues = computed(() => new Set(traces.value.flatMap((trace) => trace.history)));

const traceLines = computed(() => (
    traces.value.flatMap((trace) => (
        trace.history.slice(1).map((value, index) => ({
            id: `${trace.id}-${index}`,
            from: getDialPoint(trace.history[index]),
            to: getDialPoint(value),
            party: trace.party,
            phase: trace.phase,
        }))
    ))
));

const sharedKey = computed(() => {
    const aliceShared = dhStore.parties.alice.sharedPosition;
    const bobShared = dhStore.parties.bob.sharedPosition;

    return aliceShared === bobShared ? aliceShared : null;
});

function isCurrentValue(value: number): boolean {
    return partyIds.some((partyId) => {
        const party = dhStore.parties[partyId];

        return party.publicPosition === value || party.sharedPosition === value;
    });
}

function pointClasses(value: number): Record<string, boolean> {
    return {
        visited: visitedValues.value.has(value),
        current: isCurrentValue(value),
        "alice-public": value === dhStore.parties.alice.publicPosition,
        "bob-public": value === dhStore.parties.bob.publicPosition,
        "shared-key": sharedKey.value !== null && value === sharedKey.value,
    };
}
</script>

<template>
    <aside class="dial-panel">
        <div class="dial-title">
            <h2>Позиції на циферблаті</h2>
            <p>
                Лінії показують послідовність множень. Суцільні лінії ведуть до публічного числа,
                пунктирні - до спільного ключа.
            </p>
        </div>

        <svg class="dial" viewBox="0 0 520 520" role="img" aria-label="Позиції та переходи на циферблаті">
            <line
                v-for="line in traceLines"
                :key="line.id"
                :x1="line.from.x"
                :y1="line.from.y"
                :x2="line.to.x"
                :y2="line.to.y"
                class="dial-line"
                :class="[`dial-line-${line.party}`, `dial-line-${line.phase}`]"
            />

            <g v-for="value in values" :key="value">
                <circle
                    :cx="getDialPoint(value).x"
                    :cy="getDialPoint(value).y"
                    :r="dialConfig.pointRadius"
                    class="dial-point"
                    :class="pointClasses(value)"
                />
                <text
                    :x="getDialPoint(value).x"
                    :y="getDialPoint(value).y"
                    class="dial-label"
                    :class="{ current: isCurrentValue(value) }"
                >
                    {{ value }}
                </text>
            </g>
        </svg>

        <div class="legend">
            <span class="legend-item alice-color">Аліса</span>
            <span class="legend-item bob-color">Коля</span>
            <span class="legend-item shared-color">Спільний ключ</span>
        </div>
    </aside>
</template>

<style scoped>
.dial-panel {
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid #dde3f2;
    border-radius: 8px;
    box-shadow: 0 18px 50px rgba(40, 52, 91, 0.08);
    padding: 18px;
    position: sticky;
    top: 18px;
}

.dial-title h2 {
    font-size: 22px;
    margin: 0 0 6px;
}

.dial-title p {
    color: #667394;
    line-height: 1.45;
    margin: 0 0 12px;
}

.dial {
    background: #fbfcff;
    border: 1px solid #e1e6f3;
    border-radius: 8px;
    display: block;
    height: auto;
    width: 100%;
}

.dial-line {
    fill: none;
    opacity: 0.96;
    stroke-linecap: round;
    stroke-width: 4;
}

.dial-line-alice {
    stroke: #c1121f;
}

.dial-line-bob {
    stroke: #005bbb;
}

.dial-line-shared {
    opacity: 1;
    stroke: #007a35;
    stroke-dasharray: 7 8;
    stroke-width: 4.5;
}

.dial-point {
    fill: #fff;
    stroke: #37415f;
    stroke-width: 1.5;
}

.dial-point.visited {
    fill: #eef3ff;
}

.dial-point.current {
    stroke-width: 3;
}

.dial-point.alice-public {
    fill: #ffe8ea;
    stroke: #d64550;
}

.dial-point.bob-public {
    fill: #e6f0ff;
    stroke: #2364aa;
}

.dial-point.shared-key {
    fill: #dff8eb;
    stroke: #1f8a55;
}

.dial-label {
    dominant-baseline: middle;
    fill: #172033;
    font-size: 12px;
    font-weight: 700;
    pointer-events: none;
    text-anchor: middle;
}

.legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}

.legend-item {
    border: 1px solid #dde3f2;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 800;
    padding: 6px 10px;
}

.alice-color {
    color: #b72d38;
}

.bob-color {
    color: #1d5797;
}

.shared-color {
    color: #007a35;
}

@media (max-width: 980px) {
    .dial-panel {
        position: static;
    }
}
</style>
