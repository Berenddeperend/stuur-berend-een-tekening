<script setup lang="ts">
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";

type Photo = { name: string; thumb: string; w?: number; h?: number };

// The API returns the original filename, a small grid thumbnail, and the
// original's (orientation-corrected) dimensions for PhotoSwipe — so the client
// never has to download full-resolution images just to measure them.
const photos = ref<Photo[]>([]);

const fetchPhotos = async () => {
  photos.value = await $fetch("/api/photos");
};

fetchPhotos();

let lightbox: PhotoSwipeLightbox | null = null;

onMounted(() => {
  lightbox = new PhotoSwipeLightbox({
    gallery: "#hall-of-fame",
    children: "a",
    padding: {
      top: 10,
      bottom: 10,
      left: 0,
      right: 0,
    },
    bgOpacity: 0.3,
    pswpModule: () => import("photoswipe"),
  });
  // Safety net: if the server couldn't measure an image, fall back to a sensible
  // portrait ratio so the lightbox still opens.
  lightbox.addFilter("itemData", (itemData) => {
    if (!itemData.width || !itemData.height) {
      itemData.width = 1200;
      itemData.height = 1600;
    }
    return itemData;
  });
  lightbox.init();
});

onUnmounted(() => {
  lightbox?.destroy();
  lightbox = null;
});
</script>

<template>
  <div class="container">
    <h1 class="text-center">Stuur Berend een tekening.</h1>

    <div class="flex justify-center">
      <p class="text-center max-w-[400px]">
        Je tekening wordt <strong>direct automatisch</strong> uitgeprint op een kassabon.
      </p>
    </div>

    <div class="canvas-card">
      <Konva />
      <DrawingForm class="mt-4" />
    </div>
    <InspirationGenerator />

    <hr />

    <HowDoesThisWork />

    <hr />

    <h2>Hall of fame</h2>

    <div id="hall-of-fame" class="gallery">
      <a
        v-for="photo in photos"
        :key="photo.name"
        :href="`/photos/${photo.name}`"
        :data-pswp-width="photo.w"
        :data-pswp-height="photo.h"
        target="_blank"
        rel="noreferrer"
      >
        <img :src="`/photos/${photo.thumb}`" alt="" loading="lazy" decoding="async" />
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
