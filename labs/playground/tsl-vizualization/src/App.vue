<script setup lang="ts">
import DialPanel from "./components/DialPanel.vue";
import PartyCard from "./components/PartyCard.vue";
import PublicRules from "./components/PublicRules.vue";
import SharedResult from "./components/SharedResult.vue";
</script>

<template>
    <main class="app">
        <section class="hero">
            <p class="eyebrow">Іграшковий Diffie-Hellman</p>
            <h1>Циферблат на 23 поділки</h1>
            <p class="lead">
                У справжньому протоколі число величезне, а тут беремо маленьке просте число
                <strong>23</strong>
                і крок
                <strong>×5</strong>
                . Рух вперед рахувати легко, а от за позицією відновити кількість кроків - це
                дискретний логарифм.
            </p>
        </section>

        <PublicRules />

        <section class="demo-grid">
            <DialPanel />

            <div class="party-grid">
                <PartyCard party-id="alice" />
                <PartyCard party-id="bob" />
            </div>
        </section>

        <SharedResult />
    </main>
</template>

<style scoped>
.app {
    width: min(1180px, calc(100% - 32px));
    margin: 0 auto;
    padding: 36px 0;
}

.hero {
    max-width: 860px;
    margin-bottom: 22px;
}

.eyebrow {
    color: #3d63dd;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.08em;
    margin: 0 0 8px;
    text-transform: uppercase;
}

h1,
p {
    margin-top: 0;
}

h1 {
    font-size: clamp(34px, 5vw, 58px);
    line-height: 1;
    margin-bottom: 14px;
}

.lead {
    color: #4b587c;
    font-size: 18px;
    line-height: 1.55;
}

.demo-grid {
    align-items: start;
    display: grid;
    gap: 20px;
    grid-template-columns: minmax(360px, 520px) 1fr;
}

.party-grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 980px) {
    .demo-grid,
    .party-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 620px) {
    .app {
        width: min(100% - 20px, 1180px);
        padding: 22px 0;
    }

    h1 {
        font-size: 36px;
    }
}
</style>
