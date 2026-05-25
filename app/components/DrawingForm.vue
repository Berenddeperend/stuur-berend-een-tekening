<script setup lang="ts">
import Konva from "konva";

const stage = useState<Konva.Stage>("konvaStage");
const nickname = useLocalStorage("sbet-nickname", "");
const submitting = ref(false);

async function sendDrawing() {
  if (submitting.value || !stage.value) return;
  submitting.value = true;
  try {
    await $fetch("/api/drawing", {
      method: "post",
      body: JSON.stringify({
        drawing: stage.value.toDataURL({
          pixelRatio: 2,
        }),
        artist: nickname.value,
        date: Date.now(),
      }),
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="sendDrawing">
    <input type="text" v-model="nickname" />

    <button :disabled="submitting">{{ submitting ? "sending..." : "submit!" }}</button>
  </form>
</template>
