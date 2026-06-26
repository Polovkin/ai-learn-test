<script setup lang="ts">
import { computed } from "vue";
import { useDhStore } from "../stores/dh";
import { parties } from "../ts/constants";
import type { PartyId } from "../ts/types";

const props = defineProps<{
    partyId: PartyId;
}>();

const dhStore = useDhStore();
const party = computed(() => dhStore.parties[props.partyId]);
const partyConfig = computed(() => parties[props.partyId]);
const otherPartyId = computed(() => partyConfig.value.sharedFromParty);
const otherParty = computed(() => dhStore.parties[otherPartyId.value]);
const progress = computed(() => dhStore.partyProgress(props.partyId));

const sharedPosition = computed(() => (
    party.value.sharedPosition === null ? "-" : String(party.value.sharedPosition)
));

const sharedKey = computed(() => (
    party.value.sharedPosition === null ? "?" : String(party.value.sharedPosition)
));

const sharedFormula = computed(() => {
    if (
        party.value.sharedSteps === 0
        && otherParty.value.publicSteps < parties[otherPartyId.value].secretSteps
    ) {
        return `Чекає публічне число від ${parties[otherPartyId.value].name}`;
    }

    if (party.value.sharedSteps === 0) {
        return `Вхід: ${otherParty.value.publicPosition}. Обчислення ключа ще не почалось.`;
    }

    return party.value.sharedFormula;
});

const publicButtonText = computed(() => (
    progress.value.publicDone ? "Публічне число готове" : `Крок ${partyConfig.value.name}`
));

const sharedButtonText = computed(() => (
    progress.value.sharedDone ? "Спільний ключ готовий" : "Наступний крок ключа"
));

const historyItems = computed(() => [
    ...party.value.publicHistory.map((position, index) => ({
        id: `public-${index}`,
        text: `секретний шлях ${index}: ${position}`,
        shared: false,
    })),
    ...party.value.sharedHistory.map((position, index) => ({
        id: `shared-${index}`,
        text: `ключ ${index}: ${position}`,
        shared: true,
    })),
]);
</script>

<template>
    <article class="party-card" :class="`party-card-${partyId}`">
        <header class="party-header">
            <div>
                <p class="party-label">{{ partyConfig.name }}</p>
                <h2>Секрет: {{ partyConfig.secretSteps }} кроків</h2>
            </div>
            <strong class="key-chip">{{ sharedKey }}</strong>
        </header>

        <section class="phase">
            <h3>1. Публічний крик</h3>
            <p>
                Секретні кроки у демо:
                <strong>{{ party.publicSteps }}</strong>
                / {{ partyConfig.secretSteps }}
            </p>
            <p>
                Публічне число:
                <strong>{{ party.publicPosition }}</strong>
            </p>
            <p class="formula">{{ party.publicFormula }}</p>
            <button type="button" :disabled="!dhStore.canStepPublic(partyId)" @click="dhStore.stepParty(partyId, 'public')">
                {{ publicButtonText }}
            </button>
        </section>

        <section class="phase">
            <h3>2. Обчислює спільний ключ</h3>
            <p>
                Вхід від {{ parties[otherPartyId].name }}:
                <strong>{{ otherParty.publicPosition }}</strong>
            </p>
            <p>
                Секретний лічильник:
                <strong>{{ party.sharedSteps }}</strong>
                / {{ partyConfig.secretSteps }}
            </p>
            <p>
                Спільний секрет:
                <strong>{{ sharedPosition }}</strong>
            </p>
            <p class="formula">{{ sharedFormula }}</p>
            <button type="button" :disabled="!dhStore.canStepShared(partyId)" @click="dhStore.stepParty(partyId, 'shared')">
                {{ sharedButtonText }}
            </button>
        </section>

        <ol class="history-list" :aria-label="`Історія ${partyConfig.name}`">
            <li v-for="item in historyItems" :key="item.id" :class="{ 'shared-history-item': item.shared }">
                {{ item.text }}
            </li>
        </ol>
    </article>
</template>

<style scoped>
.party-card {
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid #dde3f2;
    border-radius: 8px;
    box-shadow: 0 18px 50px rgba(40, 52, 91, 0.08);
    overflow: hidden;
}

.party-header {
    align-items: start;
    display: flex;
    gap: 12px;
    justify-content: space-between;
    padding: 18px;
}

.party-card-alice .party-header {
    background: #fff1f2;
}

.party-card-bob .party-header {
    background: #edf5ff;
}

.party-label {
    color: #667394;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.08em;
    margin: 0 0 6px;
    text-transform: uppercase;
}

.party-header h2 {
    font-size: 24px;
    margin: 0;
}

.key-chip {
    align-items: center;
    background: #172033;
    border-radius: 999px;
    color: #fff;
    display: inline-flex;
    font-size: 24px;
    justify-content: center;
    min-width: 48px;
    padding: 8px 12px;
}

.phase {
    border-top: 1px solid #e6ebf5;
    padding: 16px 18px;
}

.phase h3 {
    font-size: 16px;
    margin: 0 0 10px;
}

.phase p {
    color: #4b587c;
    line-height: 1.4;
    margin: 0 0 8px;
}

.phase strong {
    color: #172033;
    margin-left: 6px;
}

.formula {
    background: #f7f9fe;
    border: 1px solid #e4e9f5;
    border-radius: 8px;
    color: #27385f;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    min-height: 42px;
    padding: 10px;
}

.history-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    list-style: none;
    margin: 0;
    padding: 0 18px 18px;
}

.history-list li {
    background: #f5f7fc;
    border: 1px solid #dfe5f2;
    border-radius: 999px;
    color: #4b587c;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 8px;
}

.history-list .shared-history-item {
    background: #edf9f2;
    border-color: #bfe8d1;
    color: #1f734a;
}

@media (max-width: 620px) {
    .party-header {
        align-items: stretch;
        flex-direction: column;
    }
}
</style>
