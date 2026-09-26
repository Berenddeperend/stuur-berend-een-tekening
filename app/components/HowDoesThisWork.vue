<script setup lang="ts">
// Only the media paths live here — they're locale-independent. Titles and
// descriptions are resolved from `how.<key>.*` so a locale switch is reactive
// with no watcher and no duplicated asset paths.
const steps = [
  { key: "step1", media: "/steps/drawing-2.gif" },
  { key: "step2", media: "/steps/print.gif" },
  { key: "step3", media: "/steps/hall-of-fame.jpg" },
] as const;
</script>

<template>
  <section>
    <h2>{{ $t("how.heading") }}</h2>

    <ol class="steps">
      <li v-for="step in steps" :key="step.key">
        <div class="media">
          <img :src="step.media" :alt="$t(`how.${step.key}.title`)" />
        </div>
        <div>
          <strong>{{ $t(`how.${step.key}.title`) }}</strong>
          <p>{{ $t(`how.${step.key}.description`) }}</p>
        </div>
      </li>
    </ol>

    <p class="mt-8">
      {{ $t("how.closing") }}
      <!--      Meer weten? Ik heb er-->
      <!--      <a href="www.berendswennenhuis.nl">hier</a> over geschreven.-->
    </p>
  </section>
</template>

<style scoped>
h2 {
  font-size: 1.4em;
  font-weight: 700;
  margin-bottom: 0.6em;
}

.steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.steps li {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.steps li::marker {
  display: none;
}

.steps strong {
  display: block;
  margin-bottom: 2px;
}

.steps p {
  margin: 0;
  opacity: 0.9;
}

.media {
  flex: 0 0 120px;
}

.media img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  margin: 0;
  display: block;
}

@media (max-width: 430px) {
  .media {
    flex: 0 0 90px;
  }
  .media img {
    width: 90px;
    height: 90px;
  }
}
</style>
