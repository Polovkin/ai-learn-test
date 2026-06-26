<script setup lang="ts">
import { computed } from "vue";
import { useDhStore } from "../stores/dh";
import { attackerSearchLimit, modulus, parties } from "../ts/constants";
import type { PartyId } from "../ts/types";

const dhStore = useDhStore();
const partyIds: PartyId[] = ["alice", "bob"];

const bothPublicReady = computed(() => (
    dhStore.parties.alice.publicSteps === dhStore.secretSteps.alice
    && dhStore.parties.bob.publicSteps === dhStore.secretSteps.bob
));

const elapsedText = computed(() => {
    if (dhStore.attacker.elapsedMs === null) {
        return null;
    }

    return `${dhStore.attacker.elapsedMs.toFixed(4)} мс`;
});

function formatSteps(steps: number | null): string {
    return steps === null ? "не знайдено" : `${steps}`;
}

function formatEquivalentSteps(steps: number[]): string {
    return steps.length === 0 ? "немає збігів" : steps.join(", ");
}
</script>

<template>
    <section class="attacker-panel">
        <div class="attacker-copy">
            <p class="attacker-label">Спостерігач</p>
            <h2>Маша пробує відновити секретні кроки</h2>
            <p>
                Маша бачить лише параметри демонстрації та публічні числа. Вона перебирає кроки
                й шукає всі значення, які дають таке саме публічне число.
            </p>
        </div>

        <div class="observed-values" aria-label="Публічні числа, які бачить Маша">
            <div v-for="partyId in partyIds" :key="partyId" class="observed-value">
                <span>{{ parties[partyId].name }}</span>
                <strong>{{ dhStore.parties[partyId].publicPosition }}</strong>
            </div>
        </div>

        <button type="button" :disabled="!bothPublicReady" @click="dhStore.calculateAttacker()">
            Розрахувати
        </button>

        <p v-if="!bothPublicReady" class="hint">
            Спочатку завершіть розрахунок публічних чисел для Аліси й Колі.
        </p>

        <div v-if="dhStore.attacker.results" class="attacker-result">
            <div class="result-summary">
                <strong>Час розрахунку: {{ elapsedText }}</strong>
                <span>
                    Перебір виконується на маленькому модулі p = {{ modulus }},
                    у діапазоні 0..{{ attackerSearchLimit }} кроків.
                </span>
            </div>

            <dl class="result-list">
                <div v-for="partyId in partyIds" :key="partyId">
                    <dt>{{ parties[partyId].name }}</dt>
                    <dd>
                        публічне число {{ dhStore.attacker.results[partyId].publicPosition }},
                        спроб: {{ dhStore.attacker.results[partyId].attempts }}
                    </dd>
                    <dd>
                        найменше еквівалентне значення:
                        {{ formatSteps(dhStore.attacker.results[partyId].foundSteps) }}
                    </dd>
                    <dd>
                        усі еквівалентні значення в цьому діапазоні:
                        {{ formatEquivalentSteps(dhStore.attacker.results[partyId].equivalentSteps) }}
                    </dd>
                </div>
            </dl>

            <p class="hint">
                Якщо кілька значень дають однакове публічне число, Маша не може відрізнити їх лише
                за публічними даними. У реальному Diffie-Hellman простір перебору набагато більший.
            </p>
        </div>
    </section>
</template>

<style scoped>
.attacker-panel {
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid #dde3f2;
    border-radius: 8px;
    box-shadow: 0 18px 50px rgba(40, 52, 91, 0.08);
    display: grid;
    gap: 14px;
    margin-top: 18px;
    padding: 18px;
}

.attacker-copy h2,
.attacker-copy p {
    margin-top: 0;
}

.attacker-copy h2 {
    font-size: 22px;
    margin-bottom: 8px;
}

.attacker-copy p:last-child {
    color: #4b587c;
    line-height: 1.45;
    margin-bottom: 0;
}

.attacker-label {
    color: #6b4e00;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
    text-transform: uppercase;
}

.observed-values {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.observed-value {
    background: #fff9e6;
    border: 1px solid #ead58f;
    border-radius: 8px;
    padding: 12px;
}

.observed-value span,
.observed-value strong {
    display: block;
}

.observed-value span {
    color: #6b4e00;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
    text-transform: uppercase;
}

.observed-value strong {
    color: #172033;
    font-size: 28px;
}

.hint {
    color: #667394;
    line-height: 1.45;
    margin: 0;
}

.attacker-result {
    border-top: 1px solid #e6ebf5;
    display: grid;
    gap: 12px;
    padding-top: 14px;
}

.result-summary {
    display: grid;
    gap: 4px;
}

.result-summary strong {
    color: #172033;
    font-size: 18px;
}

.result-summary span {
    color: #667394;
}

.result-list {
    display: grid;
    gap: 8px;
    margin: 0;
}

.result-list div {
    background: #f7f9fe;
    border: 1px solid #e4e9f5;
    border-radius: 8px;
    padding: 10px;
}

.result-list dt {
    color: #172033;
    font-weight: 900;
    margin-bottom: 4px;
}

.result-list dd {
    color: #4b587c;
    line-height: 1.4;
    margin: 0;
}

@media (max-width: 620px) {
    .observed-values {
        grid-template-columns: 1fr;
    }
}
</style>
