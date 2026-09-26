<script setup lang="ts">
import { RefreshCcw } from "@lucide/vue";
import { inspirationVocab } from "~/utils/inspiration";

type InspirationPick = { adj: number; subject: number; doing: number };

function roll(): InspirationPick {
  return { adj: Math.random(), subject: Math.random(), doing: Math.random() };
}

const { t, locale } = useI18n();

// useState (not a plain ref) so the random pick happens once on the server and
// is reused as-is on the client via the payload — a plain ref here would
// re-roll during client hydration and flash to a different combo than what was
// server-rendered.
//
// What's stored is three positions in [0, 1), not the resolved words: `/` ->
// `/en` is a client-side route change, so this state survives it. Resolving
// the positions against the *current* locale's lists on every render means
// the page can't be left showing stale Dutch words, with no watcher involved.
const pick = useState<InspirationPick>("inspiration", roll);

function at(list: string[], seed: number) {
  return list[Math.floor(seed * list.length)] ?? "";
}

const vocab = computed(() => inspirationVocab[locale.value] ?? inspirationVocab.nl!);
const adj = computed(() => at(vocab.value.adjectives, pick.value.adj));
const subject = computed(() => at(vocab.value.subjects, pick.value.subject));
const doing = computed(() => at(vocab.value.activities, pick.value.doing));
// Empty for Dutch, which carries its article in the lead sentence.
const article = computed(() => vocab.value.article?.(adj.value) ?? "");

function randomize() {
  pick.value = roll();
}
</script>

<template>
  <div class="inspiration">
    <button class="refresh" type="button" :aria-label="t('inspiration.refresh')" @click="randomize">
      <RefreshCcw :size="18" />
    </button>
    <p class="prompt">
      {{ t("inspiration.lead") }} {{ article }} <br />
      <span class="word">{{ adj }}</span>
      <span class="word">{{ subject }}</span>
      <span class="word">{{ doing }}</span>
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
