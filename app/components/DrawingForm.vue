<script setup lang="ts">
import Konva from "konva";

const stage = useState<Konva.Stage>("konvaStage");
const nickname = useLocalStorage("sbet-nickname", "");
const submitting = ref(false);
const waitingForVideo = ref(false);
const videoUrl = ref<string | null>(null);
const videoUnavailable = ref(false);
const {
  dialogRef,
  visible: modalVisible,
  open: openModal,
  close: closeModal,
  onCancel: onDialogCancel,
  onBackdropClick,
} = useAnimatedDialog();

const VIDEO_POLL_TIMEOUT_MS = 20_000;
const VIDEO_POLL_INTERVAL_MS = 500;

async function sendDrawing() {
  if (submitting.value || !stage.value) return;
  submitting.value = true;
  videoUrl.value = null;
  videoUnavailable.value = false;
  openModal();

  try {
    const { videoUrl: url } = await $fetch<{ videoUrl: string | null }>("/api/drawing", {
      method: "post",
      body: {
        drawing: stage.value.toDataURL({
          pixelRatio: 2,
        }),
        artist: nickname.value,
        date: Date.now(),
      },
    });
    if (url) {
      pollForVideo(url);
    } else {
      videoUnavailable.value = true;
    }
  } catch (err) {
    console.error(err);
    videoUnavailable.value = true;
  } finally {
    submitting.value = false;
  }
}

// The clip isn't ready when the print request returns — the printer camera
// still has to record + mux it. Poll until it appears, or give up quietly;
// the print itself already succeeded either way.
async function pollForVideo(url: string) {
  waitingForVideo.value = true;
  const deadline = Date.now() + VIDEO_POLL_TIMEOUT_MS;

  try {
    while (Date.now() < deadline) {
      try {
        // Nitro's [id].get.ts route only matches GET — a HEAD request 404s
        // regardless of whether the file exists, so poll with GET instead.
        const res = await fetch(url, { method: "GET" });
        if (res.ok) {
          videoUrl.value = url;
          return;
        }
      } catch {
        // Transient network error — keep polling.
      }
      await new Promise((resolve) => setTimeout(resolve, VIDEO_POLL_INTERVAL_MS));
    }
    videoUnavailable.value = true;
  } finally {
    waitingForVideo.value = false;
  }
}
</script>

<template>
  <!-- This component now has two roots (form + dialog), so Vue no longer
       auto-forwards attrs/class from the parent to either one — forward
       them to the form explicitly so e.g. `class="mt-4"` from index.vue
       still lands where it used to. -->
  <form class="drawing-form" v-bind="$attrs" @submit.prevent="sendDrawing">
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

  <dialog
    ref="dialogRef"
    class="print-modal"
    :class="{ 'is-visible': modalVisible }"
    @cancel="onDialogCancel"
    @click="onBackdropClick"
  >
<!--    <button type="button" class="close-modal" aria-label="Sluiten" @click="closeModal">×</button>-->

    <video v-if="videoUrl" :src="videoUrl" class="preview-video" controls autoplay muted loop />
    <div v-else class="loader-wrap">
      <span class="loader" />
      <p>{{ videoUnavailable ? "Verstuurd!" : "Aan het printen..." }}</p>
    </div>
  </dialog>
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

.print-modal {
  /* fixed + inset + margin:auto is what actually centers this on the
     viewport regardless of page scroll — `position: relative` (the previous
     value here) let it get pushed around by document flow/scroll instead. */
  position: fixed;
  inset: 0;
  margin: auto;
  background: #222250;
  color: #e8e6e3;
  //border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 24px 24px;
  width: min(360px, calc(100vw - 32px));

  opacity: 0;
  transform: scale(0.97);
  transition:
    opacity 0.15s ease-out,
    transform 0.15s ease-out;
}

.print-modal.is-visible {
  opacity: 1;
  transform: scale(1);
}

.print-modal::backdrop {
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.15s ease-out;
}

.print-modal.is-visible::backdrop {
  opacity: 1;
}

.close-modal {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  color: #e8e6e3;
  font-size: 1.4em;
  line-height: 1;
  padding: 4px 8px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.close-modal:hover {
  opacity: 1;
}

.loader-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
}

.loader {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #e2bc4e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loader-wrap p {
  margin: 0;
  color: rgba(179, 179, 222, 0.8);
}

.preview-video {
  display: block;
  width: 100%;
  border-radius: 4px;
}
</style>
