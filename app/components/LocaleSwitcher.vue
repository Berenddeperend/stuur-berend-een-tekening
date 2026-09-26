<script setup lang="ts">
import type { LocaleObject } from "@nuxtjs/i18n";

const { t, locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

// composer.locales is typed as Locale[] | LocaleObject[] because either shape
// is configurable; nuxt.config.ts uses objects.
const options = computed(() => locales.value as LocaleObject[]);
</script>

<template>
  <nav class="locale-switcher" :aria-label="t('localeSwitcher.label')">
    <NuxtLink
      v-for="option in options"
      :key="option.code"
      :to="switchLocalePath(option.code)"
      :class="{ 'is-active': option.code === locale }"
      :hreflang="option.language ?? option.code"
      :title="option.name"
    >
      {{ option.code.toUpperCase() }}
    </NuxtLink>
  </nav>
</template>

<style scoped>
.locale-switcher {
  position: absolute;
  top: 10px;
  right: 0;
  display: inline-flex;
  overflow: hidden;
  background: #12123e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.locale-switcher a {
  padding: 7px 10px;
  color: #9ca3af;
  text-decoration: none;
  transition:
    color 0.15s,
    background 0.15s;
}

.locale-switcher a + a {
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.locale-switcher a:hover {
  color: #e8e6e3;
}

.locale-switcher a.is-active {
  background: rgba(226, 188, 78, 0.12);
  color: #e2bc4e;
}
</style>
