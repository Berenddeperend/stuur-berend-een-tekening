<script lang="ts" setup>
defineProps({
  active: Boolean,
});
</script>

<template>
  <div
    class="border border-slate-400 cursor-pointer hover:bg-slate-200 flex items-center justify-center size-12"
    :class="{ 'bg-green-300': active }"
  >
    <slot />
  </div>
</template>
