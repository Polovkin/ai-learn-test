<template>
    <section class="public-rules" aria-label="Публічні параметри">
        <div class="rule">
            <span class="label">Публічно</span>
            <strong>p = 23</strong>
            <span>циферблат</span>
        </div>
        <div class="rule">
            <span class="label">Публічно</span>
            <strong>g = 5</strong>
            <span>множник кроку</span>
        </div>
        <div class="rule">
            <span class="label">Старт</span>
            <strong>1</strong>
            <span>перша позиція</span>
        </div>
    </section>
</template>

<style scoped>
.public-rules {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin: 24px 0;
}

.rule {
    background: #fff;
    border: 1px solid #dde3f2;
    border-radius: 8px;
    padding: 14px;
}

.rule strong,
.rule span {
    display: block;
}

.rule strong {
    font-size: 26px;
    margin: 4px 0;
}

.label {
    color: #667394;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

@media (max-width: 980px) {
    .public-rules {
        grid-template-columns: 1fr;
    }
}
</style>
