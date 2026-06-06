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
      body: {
        drawing: stage.value.toDataURL({
          pixelRatio: 2,
        }),
        artist: nickname.value,
        date: Date.now(),
      },
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="drawing-form" @submit.prevent="sendDrawing">
    <input
      v-model="nickname"
      type="text"
      placeholder="Je naam"
      class="nickname"
      autocomplete="off"
      maxlength="30"
    />

    <button :disabled="submitting" class="submit">
      {{ submitting ? "Versturen..." : "Verstuur" }}
    </button>
  </form>
</template>

<style scoped>
.drawing-form {
  display: flex;
  gap: 8px;
}

.nickname {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: #e8e6e3;
  font: inherit;
  padding: 8px 10px;
  outline: none;
  transition: border-color 0.15s;
}

.nickname::placeholder {
  color: rgba(179, 179, 222, 0.5);
}

.nickname:focus {
  border-color: #e2bc4e;
}

.submit {
  background: transparent;
  border: 1px solid #e2bc4e;
  border-radius: 4px;
  color: #e2bc4e;
  font: inherit;
  font-weight: 700;
  padding: 8px 16px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.submit:hover:not(:disabled) {
  background: #e2bc4e;
  color: #222250;
}

.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
