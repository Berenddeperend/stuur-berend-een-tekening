<script setup lang="ts">
const props = defineProps<{ authHeaders: Record<string, string> }>();
const emit = defineEmits<{ uploaded: []; unauthorized: [] }>();

const {
  dialogRef,
  visible,
  open: openModal,
  close: closeModal,
  onCancel: onDialogCancel,
  onBackdropClick,
} = useAnimatedDialog();

const videoRef = ref<HTMLVideoElement | null>(null);

let stream: MediaStream | null = null;
const cameraError = ref<string | null>(null);
const capturedBlob = ref<Blob | null>(null);
const capturedUrl = ref<string | null>(null);
const uploading = ref(false);
const uploadError = ref<string | null>(null);

async function startCamera() {
  cameraError.value = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    // The <video> sits behind `v-if="!capturedUrl"`, which was just reset —
    // wait a tick for that DOM update to land before touching the ref.
    await nextTick();
    if (videoRef.value) videoRef.value.srcObject = stream;
  } catch (err) {
    console.error(err);
    cameraError.value = "Kan de camera niet openen. Controleer of je toestemming hebt gegeven.";
  }
}

function stopCamera() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  if (videoRef.value) videoRef.value.srcObject = null;
}

function resetCapture() {
  if (capturedUrl.value) URL.revokeObjectURL(capturedUrl.value);
  capturedUrl.value = null;
  capturedBlob.value = null;
  uploadError.value = null;
}

watch(visible, (isVisible) => {
  if (isVisible) {
    resetCapture();
    startCamera();
  } else {
    stopCamera();
    resetCapture();
    cameraError.value = null;
  }
});

onUnmounted(() => {
  stopCamera();
  if (capturedUrl.value) URL.revokeObjectURL(capturedUrl.value);
});

function retake() {
  // The stream is still live — the live view reappears instantly, no
  // re-acquisition, no risk of re-triggering the permission prompt.
  resetCapture();
}

function capture() {
  const video = videoRef.value;
  if (!video || !video.videoWidth) return;

  // The guide box is purely a visual aid for framing — capture the full
  // frame uncropped, at native resolution. The server generates a 500px
  // grid thumbnail separately, so no downscaling needed here either.
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      capturedBlob.value = blob;
      capturedUrl.value = URL.createObjectURL(blob);
    },
    "image/jpeg",
    0.9,
  );
}

async function upload() {
  if (!capturedBlob.value || uploading.value) return;
  uploading.value = true;
  uploadError.value = null;
  try {
    const formData = new FormData();
    formData.append("photo", capturedBlob.value, "capture.jpg");
    // No manual Content-Type — the browser needs to set the multipart boundary itself.
    await $fetch("/api/photos", { method: "POST", body: formData, headers: props.authHeaders });
    emit("uploaded");
    closeModal(); // triggers the visible watcher, which stops the camera
  } catch (err: unknown) {
    if ((err as { statusCode?: number })?.statusCode === 401) {
      emit("unauthorized");
      closeModal();
    } else {
      uploadError.value = "Uploaden mislukt. Probeer opnieuw.";
    }
  } finally {
    uploading.value = false;
  }
}

defineExpose({ open: openModal, close: closeModal });
</script>

<template>
  <dialog
    ref="dialogRef"
    class="camera-modal"
    :class="{ 'is-visible': visible }"
    @cancel="onDialogCancel"
    @click="onBackdropClick"
  >
    <button type="button" class="close-modal" aria-label="Sluiten" @click="closeModal">×</button>

    <div v-if="cameraError" class="camera-error">
      <p>{{ cameraError }}</p>
    </div>

    <template v-else>
      <div v-if="!capturedUrl" class="preview-wrap">
        <video ref="videoRef" autoplay playsinline muted class="preview-video" />
        <div class="guide-overlay" />
      </div>
      <div v-else class="review-wrap">
        <img :src="capturedUrl" alt="Gemaakte foto" class="review-image" />
      </div>

      <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>

      <div class="camera-actions">
        <button v-if="!capturedUrl" type="button" class="capture-btn" @click="capture">
          Maak foto
        </button>
        <template v-else>
          <button type="button" :disabled="uploading" @click="retake">Opnieuw</button>
          <button type="button" class="save-btn" :disabled="uploading" @click="upload">
            {{ uploading ? "Bezig..." : "Opslaan" }}
          </button>
        </template>
      </div>
    </template>
  </dialog>
</template>

<style scoped>
.camera-modal {
  position: fixed;
  inset: 0;
  margin: auto;
  background: #222250;
  color: #e8e6e3;
  border-radius: 8px;
  padding: 24px;
  width: min(360px, calc(100vw - 32px));

  opacity: 0;
  transform: scale(0.97);
  transition:
    opacity 0.15s ease-out,
    transform 0.15s ease-out;
}

.camera-modal.is-visible {
  opacity: 1;
  transform: scale(1);
}

.camera-modal::backdrop {
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.15s ease-out;
}

.camera-modal.is-visible::backdrop {
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

.preview-wrap,
.review-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 8px;
  background: #000;
}

.preview-video,
.review-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.guide-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 70%;
  aspect-ratio: 78 / 118;
  border: 2px solid #e2bc4e;
  border-radius: 4px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.camera-error {
  padding: 40px 0;
  text-align: center;
  color: #e08b8b;
}

.upload-error {
  color: #e08b8b;
  margin: 12px 0 0;
  font-size: 0.9em;
  text-align: center;
}

.camera-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.camera-actions button {
  border-radius: 4px;
  font: inherit;
  font-weight: 700;
  padding: 10px 16px;
  min-height: 44px;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #e8e6e3;
}

.camera-actions button:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.6);
}

.camera-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.camera-actions .capture-btn,
.camera-actions .save-btn {
  border-color: #e2bc4e;
  color: #e2bc4e;
}

.camera-actions .capture-btn:hover:not(:disabled),
.camera-actions .save-btn:hover:not(:disabled) {
  background: #e2bc4e;
  color: #222250;
}
</style>
