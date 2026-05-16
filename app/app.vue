<script setup lang="ts">
const photos = ref();
const file = ref();

const fetchPhotos = async () => {
  photos.value = await $fetch("/api/photos");
};

fetchPhotos();

const onFileChange = (e) => {
  console.log(e);
  file.value = e.target.files[0];

  sendPhoto();
};

async function sendPhoto() {
  const formData = new FormData();
  formData.append("photo", file.value);

  await $fetch("/api/photos", {
    method: "post",
    body: formData,
  });
  fetchPhotos();
}
</script>

<template>
  <Wrapper class="bg-green-100 py-8">
    <ClientOnly>
      <Konva />
      <DrawingForm />
    </ClientOnly>
  </Wrapper>

  <HowDoesThisWork />

  <!--      <form @submit.prevent="sendPhoto">-->
  <!--        <input type="file" @change="onFileChange" />-->
  <!--        <br />-->
  <!--      </form>-->

  <Wrapper class="bg-green-100 py-8">
    <h1 class="text-center text-xl">Stuur Berend een tekening</h1>

    <div class="flex items-center gap-3 flex-wrap">
      <img v-for="photo in photos" :src="`/photos/${photo}`" alt="" class="w-1/4 h-min" />
    </div>
  </Wrapper>
</template>
