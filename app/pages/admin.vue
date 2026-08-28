<script lang="ts" setup>
import { onMounted } from "vue";
import { Home } from "@lucide/vue";
import type { DrawingEntry, Photo } from "~/types";
import CameraCapture from "~/components/CameraCapture.vue";

const { password, authHeaders, handleUnauthorized } = useAdminAuth();
const passwordInput = ref("");
const loginError = ref(false);

const data = ref<DrawingEntry[]>();
const photos = ref<Photo[]>([]);
const cameraRef = ref<InstanceType<typeof CameraCapture> | null>(null);

async function fetchPrintQueue() {
  try {
    data.value = await $fetch("/api/print-queue", { headers: authHeaders.value });
  } catch (err) {
    if (handleUnauthorized(err)) loginError.value = true;
    else throw err;
  }
}

async function fetchPhotos() {
  photos.value = await $fetch("/api/photos"); // stays ungated — public Hall of Fame data
}

async function printDrawing(row: DrawingEntry) {
  try {
    await $fetch("/api/print-queue", {
      method: "POST",
      headers: authHeaders.value,
      body: {
        artist: row.artist,
        date: row.date,
        drawing: `${row.drawing}`,
      },
    });
  } catch (err) {
    if (!handleUnauthorized(err)) throw err;
  }
}

async function deleteDrawing(row: DrawingEntry) {
  if (!confirm(`Tekening van "${row.artist || "anoniem"}" verwijderen?`)) return;
  try {
    await $fetch(`/api/drawing/${row.id}`, { method: "DELETE", headers: authHeaders.value });
    await fetchPrintQueue();
  } catch (err) {
    if (!handleUnauthorized(err)) throw err;
  }
}

async function deletePhoto(photo: Photo) {
  if (!confirm("Foto verwijderen uit de Hall of Fame?")) return;
  try {
    await $fetch(`/api/photos/${photo.name}`, { method: "DELETE", headers: authHeaders.value });
    await fetchPhotos();
  } catch (err) {
    if (!handleUnauthorized(err)) throw err;
  }
}

function submitLogin() {
  loginError.value = false;
  password.value = passwordInput.value; // triggers the watcher below
  passwordInput.value = "";
}

function logout() {
  password.value = "";
}

function onCameraUnauthorized() {
  loginError.value = handleUnauthorized({ statusCode: 401 });
}

watch(password, (val) => {
  if (val) fetchPrintQueue();
});

onMounted(() => {
  fetchPhotos(); // ungated, always safe
  if (password.value) fetchPrintQueue();
});
</script>

<template>
  <div class="admin-page">
    <form v-if="!password" class="login-form" @submit.prevent="submitLogin">
      <h1>Admin</h1>
      <input
        v-model="passwordInput"
        type="password"
        placeholder="Wachtwoord"
        autocomplete="current-password"
      />
      <button type="submit">Inloggen</button>
      <p v-if="loginError" class="login-error">Onjuist wachtwoord.</p>
    </form>

    <div v-else class="admin-content">
      <button type="button" class="logout" @click="logout">Uitloggen</button>

      <section>
        <h2>Tekeningen</h2>
        <div class="queue-list">
          <div v-for="row in data" :key="row.id" class="queue-row">
            <img class="thumb" :src="`data:image/png;base64,${row.drawing}`" alt="" />
            <div class="meta">
              <strong>{{ row.artist || "anoniem" }}</strong>
              <span>{{ row.date }}</span>
            </div>
            <div class="actions">
              <button type="button" @click="printDrawing(row)">Print</button>
              <button type="button" class="danger" @click="deleteDrawing(row)">Verwijder</button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="section-header">
          <h2>Hall of Fame</h2>
          <button type="button" class="camera-btn" @click="cameraRef?.open()">Foto maken</button>
        </div>
        <div class="photo-grid">
          <div v-for="photo in photos" :key="photo.name" class="photo-cell">
            <img :src="`/photos/${photo.thumb}`" alt="" loading="lazy" />
            <button
              type="button"
              class="delete-btn"
              aria-label="Verwijderen"
              @click="deletePhoto(photo)"
            >
              ×
            </button>
          </div>
        </div>
      </section>

      <CameraCapture
        ref="cameraRef"
        :auth-headers="authHeaders"
        @uploaded="fetchPhotos"
        @unauthorized="onCameraUnauthorized"
      />
    </div>
  </div>

  <NuxtLink to="/" class="home-btn" aria-label="Terug naar home">
    <Home :size="16" />
  </NuxtLink>
</template>

<style scoped>
.admin-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 30px 16px;
  color: #e8e6e3;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 280px;
  margin: 60px auto 0;
  text-align: center;
}

.login-form h1 {
  font-size: 1.4em;
  margin: 0 0 8px;
}

.login-form input {
  width: 100%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: #e8e6e3;
  font: inherit;
  padding: 10px 12px;
  outline: none;
}

.login-form input:focus {
  border-color: #e2bc4e;
}

.login-form button {
  width: 100%;
  background: transparent;
  border: 1px solid #e2bc4e;
  border-radius: 4px;
  color: #e2bc4e;
  font: inherit;
  font-weight: 700;
  padding: 10px 16px;
  cursor: pointer;
}

.login-form button:hover {
  background: #e2bc4e;
  color: #222250;
}

.login-error {
  color: #e08b8b;
  margin: 0;
  font-size: 0.9em;
}

.logout {
  display: block;
  margin: 0 0 20px auto;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: #e8e6e3;
  font: inherit;
  padding: 8px 14px;
  cursor: pointer;
}

section {
  margin-bottom: 32px;
}

h2 {
  font-size: 1.2em;
  font-weight: 700;
  margin: 0 0 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-header h2 {
  margin: 0;
}

.queue-list {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.queue-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: #fff;
}

.meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 120px;
}

.meta span {
  font-size: 0.85em;
  color: rgba(179, 179, 222, 0.7);
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  border-radius: 4px;
  font: inherit;
  cursor: pointer;
  padding: 10px 14px;
  min-height: 44px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #e8e6e3;
}

button:hover {
  border-color: rgba(255, 255, 255, 0.6);
}

button.danger {
  border-color: #e08b8b;
  color: #e08b8b;
}

button.danger:hover {
  background: #e08b8b;
  color: #222250;
}

button.camera-btn {
  border-color: #e2bc4e;
  color: #e2bc4e;
  white-space: nowrap;
}

button.camera-btn:hover {
  background: #e2bc4e;
  color: #222250;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
}

.photo-cell {
  position: relative;
}

.photo-cell img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  display: block;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  min-height: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(34, 34, 80, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #e8e6e3;
  font-size: 1.1em;
  line-height: 1;
}

.delete-btn:hover {
  background: #e08b8b;
  border-color: #e08b8b;
  color: #222250;
}

.home-btn {
  position: fixed;
  left: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.15);
  transition: color 0.2s;
}

.home-btn:hover {
  color: rgba(255, 255, 255, 0.5);
}
</style>
