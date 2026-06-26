<script setup lang="ts">
import { computed } from "vue";
import { useDhStore } from "../stores/dh";
import { parties } from "../ts/constants";

const dhStore = useDhStore();

const status = computed(() => {
    const alice = dhStore.parties.alice;
    const bob = dhStore.parties.bob;
    const bothPublicReady = (
        alice.publicSteps === parties.alice.secretSteps
        && bob.publicSteps === parties.bob.secretSteps
    );
    const bothSharedReady = (
        alice.sharedSteps === parties.alice.secretSteps
        && bob.sharedSteps === parties.bob.secretSteps
    );

    if (!bothPublicReady) {
        return {
            text: "Секретні лічильники ще крутяться. Публічними стануть тільки фінальні числа: 8 від Аліси і 19 від Колі.",
            tone: "waiting",
        };
    }

    if (!bothSharedReady) {
        return {
            text: "Публічні числа вже відомі: Аліса сказала 8, Коля сказав 19. Тепер кожен рахує ключ зі своїм секретним лічильником.",
            tone: "waiting",
        };
    }

    if (dhStore.sharedMatch) {
        return {
            text: `Збіглось: Аліса і Коля отримали ${alice.sharedPosition}. Це і є спільний секрет.`,
            tone: "success",
        };
    }

    return {
        text: "Не збіглось. Десь у кроках помилка.",
        tone: "",
    };
});
</script>

<template>
    <section class="shared-result" aria-live="polite">
        <p :class="status.tone">{{ status.text }}</p>
        <button type="button" @click="dhStore.reset()">Скинути демо</button>
    </section>
</template>

<style scoped>
.shared-result {
    align-items: center;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid #dde3f2;
    border-radius: 8px;
    box-shadow: 0 18px 50px rgba(40, 52, 91, 0.08);
    display: flex;
    gap: 14px;
    justify-content: space-between;
    margin-top: 18px;
    padding: 16px 18px;
}

.shared-result p {
    color: #4b587c;
    font-size: 17px;
    font-weight: 700;
    margin: 0;
}

.shared-result p.success {
    color: #1f8a55;
}

.shared-result p.waiting {
    color: #3d63dd;
}

@media (max-width: 620px) {
    .shared-result {
        align-items: stretch;
        flex-direction: column;
    }
}
</style>
