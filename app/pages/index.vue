<script setup lang="ts">
const photos = ref<string[]>();

const fetchPhotos = async () => {
  photos.value = await $fetch("/api/photos");
};

fetchPhotos();
</script>

<template>
  <div class="container">
    <h1 class="text-center">Stuur Berend een tekening.</h1>

    <div class="flex justify-center">
      <p class="text-center max-w-[400px]">
        Je tekening wordt <strong>direct automatisch</strong> uitgeprint op een kassabon.
      </p>
    </div>

    <!--    <svg-->
    <!--      class="hero-arrow"-->
    <!--      viewBox="0 0 140 200"-->
    <!--      fill="none"-->
    <!--      stroke="currentColor"-->
    <!--      stroke-width="2.5"-->
    <!--      stroke-linecap="round"-->
    <!--      stroke-linejoin="round"-->
    <!--      aria-hidden="true"-->
    <!--    >-->
    <!--      <path d="M 20 15 Q 140 90, 35 180" />-->
    <!--      <path d="M 25 170 L 35 180 L 48 173" />-->
    <!--    </svg>-->

    <div class="canvas-card">
      <Konva />
      <DrawingForm class="mt-4" />
    </div>
    <InspirationGenerator />

    <hr />

    <HowDoesThisWork />

    <hr />

    <h2>Hall of fame</h2>

    <div class="gallery">
      <a v-for="photo in photos" :key="photo" :href="`/photos/${photo}`" target="_blank">
        <img :src="`/photos/${photo}`" alt="" />
      </a>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 590px;
  margin: 0 auto;
  padding: 40px 30px 0;
  position: relative;
}

.hero-arrow {
  position: absolute;
  top: 100px;
  right: -20px;
  width: 130px;
  height: 180px;
  color: #e2bc4e;
  opacity: 0.85;
  pointer-events: none;
}

@media (max-width: 560px) {
  .hero-arrow {
    display: none;
  }
}

h1 {
  font-size: 2em;
  font-weight: 700;
  margin-bottom: 0.5em;
}

.subtitle {
  font-size: 12px;
  text-align: center;
  color: #9ca3af;
}

h2 {
  font-size: 1.4em;
  font-weight: 700;
  margin-bottom: 0.4em;
}

p {
  margin: 0 0 1em;
}

.canvas-card {
  margin: 30px auto 10px;
  padding: 12px;
  background: #12123e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  max-width: 320px;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 16px;
}

.gallery img {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  margin: 0;
  display: block;
}

@media (max-width: 430px) {
  .gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}

.admin-link {
  margin-top: 40px;
  opacity: 0.5;
  font-size: 0.85em;
}
</style>
