<script setup lang="ts">
const steps = [
  {
    title: "1. Maak een tekening",
    description: "Teken hierboven iets moois.",
    media: "/steps/drawing-2.gif",
  },
  {
    title: "2. Klik op 'versturen'",
    description: "Je tekening rolt automatisch uit mijn bonnetjesprinter.",
    media: "/steps/print.gif",
  },
  {
    title: "3. Hall of fame",
    description:
      "Is het een leuke tekening? Dan maak ik er een foto van en komt hij in de Hall of Fame. 👇",
    media: "/steps/hall-of-fame.jpg",
  },
];
</script>

<template>
  <section>
    <h2>Hoe werkt het?</h2>

    <ol class="steps">
      <li v-for="step in steps" :key="step.title">
        <div class="media">
          <img :src="step.media" :alt="step.title" />
        </div>
        <div>
          <strong>{{ step.title }}</strong>
          <p>{{ step.description }}</p>
        </div>
      </li>
    </ol>

    <p class="mt-4">
      Veel plezier, en probeer de hoeveelheid piemels enigszins te beperken. Meer weten? Ik heb er
      <a href="www.berendswennenhuis.nl">hier</a> over geschreven.
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
