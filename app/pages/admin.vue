<script lang="ts" setup>
import { onMounted } from "vue";
import type { DrawingEntry } from "~/types";

const data = ref<DrawingEntry[]>();

async function fetchPrintQueue() {
  data.value = await $fetch("/api/print-queue", {});
}

console.log(import.meta.env.PRINTER_PASSWORD);

async function printDrawing(row: DrawingEntry) {
  await $fetch("/api/print-queue", {
    method: "POST",
    body: {
      artist: row.artist,
      date: row.date,
      drawing: `${row.drawing}`,
    },
  });
}

onMounted(fetchPrintQueue);
</script>

<template>
  <div>admin page</div>

  <client-only>
    <table>
      <thead>
        <tr>
          <td>nickname</td>
          <td>date</td>
          <td>drawing</td>
          <td>actie</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data">
          <td>{{ row.artist }}</td>
          <td>{{ row.date }}</td>
          <td>
            <img class="w-1/4" :src="`data:image/png;base64, ${row.drawing}`" alt="" />
          </td>
          <td>
            <button @click="printDrawing(row)">print</button>
          </td>
        </tr>
      </tbody>
    </table>
  </client-only>

  <!--  <pre>{{ data }}</pre>-->
</template>
