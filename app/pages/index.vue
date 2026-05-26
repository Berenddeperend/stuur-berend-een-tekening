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

  await $fetch("/api/drawing", {
    method: "post",
    body: formData,
  });
  fetchPhotos();
}
</script>

<template>
  <div>
    <Wrapper class="bg-[#8ddcdc] py-8">
      <h1 class="text-4xl my-4 text-center">Stuur Berend een tekening</h1>

      <ClientOnly>
        <!--        <InspirationGenerator />-->

        <div class="flex flex-col items-center">
          <!--          288-->
          <div class="max-w-[304px] p-2 w-full bg-white shadow-xl translate-y-24">
            <Konva />
            <DrawingForm class="mt-4" />
          </div>
        </div>
      </ClientOnly>
    </Wrapper>

    <HowDoesThisWork />

    <Wrapper class="bg-green-100 py-8">
      <h1 class="text-center text-xl">Stuur Berend een tekening</h1>

      <div class="flex items-center gap-3 flex-wrap">
        <img v-for="photo in photos" :src="`/photos/${photo}`" alt="" class="w-1/4 h-min" />
      </div>
    </Wrapper>

    <section class="bg-blue-500 py-16">
      <div class="max-w-4xl mx-auto bg-white p-8 translate-y-24">Panel content</div>
    </section>
    <section class="bg-gray-100 pt-32">Next section</section>

    <NuxtLink to="/admin">admin</NuxtLink>
  </div>
</template>
