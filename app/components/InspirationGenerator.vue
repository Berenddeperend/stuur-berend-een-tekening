<script setup lang="ts">
import { RefreshCcw } from "@lucide/vue";

type Inspiration = { adj: string; subject: string; doing: string };

function pickRandomFromArray(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickInspiration(): Inspiration {
  return {
    adj: pickRandomFromArray(
      "grote kleine schattige sterke dronken sexy onhandige gladde muzikale hongerige".split(" "),
    ),
    subject: pickRandomFromArray(
      "kip hamster hond kat pony schildpad walvis acrobaat clown detective dokter bouwvakker muzikant cowboy politicus dino".split(
        " ",
      ),
    ),
    doing: pickRandomFromArray([
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
      "aan het zeilen",
      "aan het eten",
    ]),
  };
}

// useState (not a plain ref) so the random pick happens once on the server
// and is reused as-is on the client via the payload — a plain ref here would
// re-run pickInspiration() again during client hydration, picking a
// different combo than what was server-rendered and flashing to it.
const inspiration = useState<Inspiration>("inspiration", pickInspiration);

function randomize() {
  inspiration.value = pickInspiration();
}
</script>

<template>
  <div class="inspiration">
    <button class="refresh" type="button" aria-label="Nieuwe inspiratie" @click="randomize">
      <RefreshCcw :size="18" />
    </button>
    <p class="prompt">
      Inspiratie nodig? Teken een <br />
      <span class="word">{{ inspiration.adj }}</span>
      <span class="word">{{ inspiration.subject }}</span>
      <span class="word">{{ inspiration.doing }}</span>
    </p>
  </div>
</template>

<style scoped>
.inspiration {
  position: relative;
  margin: 10px auto;
  padding: 16px 44px 16px 16px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
}

.prompt {
  margin: 0;
  line-height: 2;
  /* Reserve space so the card doesn't resize as the words change. */
  min-height: 4em;
}

.word {
  display: inline-block;
  padding: 0px 4px;
  margin: 1px;
  border-radius: 4px;
  background: rgba(226, 188, 78, 0.12);
  color: #e2bc4e;
  //font-weight: 600;
  white-space: nowrap;
}

.refresh {
  position: absolute;
  top: 19px;
  right: 8px;
  display: inline-flex;
  padding: 6px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition:
    color 0.2s,
    transform 0.3s ease;
}

.refresh:hover {
  color: #e2bc4e;
}

.refresh:active {
  transform: rotate(-180deg);
}
</style>
