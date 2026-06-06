<script setup lang="ts">
const photos = ref<string[]>();

const fetchPhotos = async () => {
  photos.value = await $fetch("/api/photos");
};

fetchPhotos();
</script>

<template>
  <div>
    <!-- Hero: the green gradient is a backdrop that the drawing card half-overlaps -->
    <section class="hero">
      <div class="hero-bg" aria-hidden="true"></div>

      <Wrapper class="px-4">
        <h1 class="hero-title">Stuur Berend<br />een tekening</h1>

        <!-- InspirationGenerator -->

        <div class="drawing-card">
          <Konva />
          <DrawingForm class="mt-4" />
        </div>
      </Wrapper>
    </section>

    <HowDoesThisWork />

    <Wrapper class="bg-green-100 py-8 px-4">
      <h1 class="text-center text-xl">Stuur Berend een tekening</h1>

      <div class="flex items-center gap-3 flex-wrap">
        <img
          v-for="photo in photos"
          :key="photo"
          :src="`/photos/${photo}`"
          alt=""
          class="w-1/4 h-min"
        />
      </div>
    </Wrapper>

    <NuxtLink to="/admin">admin</NuxtLink>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
}

/* Gradient backdrop, sized so its bottom edge falls across the middle of the card */
.hero-bg {
  position: absolute;
  inset: 0 0 auto 0;
  height: 430px;
  background: linear-gradient(180deg, #dff9ff 0%, #49e4b1 100%);
  z-index: -1;
}

.hero-title {
  font-family: "Khmer MN";
  font-size: 2.25rem;
  line-height: 1.1;
  text-align: center;
  padding-top: 2.5rem;
  padding-bottom: 2rem;
}

/* Sits in normal flow so everything below accounts for its real height */
.drawing-card {
  width: 100%;
  max-width: 304px;
  margin-inline: auto;
  padding: 0.5rem;
  background: #fff;
  box-shadow:
    0 20px 25px -5px rgb(0 0 0 / 0.1),
    0 8px 10px -6px rgb(0 0 0 / 0.1);
}
</style>
