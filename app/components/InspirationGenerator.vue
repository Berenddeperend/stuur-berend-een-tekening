<script setup lang="ts">
import { RefreshCcw } from "@lucide/vue";
function pickRandomFromArray(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const adj = ref();
const subject = ref();
const doing = ref();

const randomize = () => {
  adj.value = pickRandomFromArray(
    "grote kleine schattige sterke dronken sexy onhandige gladde muzikale hongerige".split(" "),
  );
  subject.value = pickRandomFromArray(
    "kip hamster hond kat pony acrobaat clown detective dokter bouwvakker muzikant cowboy politicus dino".split(
      " ",
    ),
  );
  doing.value = pickRandomFromArray([
    "op stelten",
    "in de kroeg",
    "aan het fietsen",
    "op vakantie",
    "in de bergen",
    "aan het tekenen",
    "aan het skinny dippen",
    "in een trein",
    "op een skateboard",
    "in bad",
    "aan het zingen",
    "aan aan het zeilen",
    "aan aan het eten",
  ]);
};

randomize();
</script>

<template>
  <p>
    Inspiratie nodig? Teken een <span class="block">{{ adj }}</span
    >&#32; <span class="block">{{ subject }}</span> <span class="block">{{ doing }}</span
    >.
  </p>
  <RefreshCcw @click="randomize" />
</template>

<style scoped>
.block {
  display: inline-block;
  padding: 2px;
  border: 1px solid gray;
}
</style>
