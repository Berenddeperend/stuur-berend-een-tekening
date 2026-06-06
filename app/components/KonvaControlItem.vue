<script lang="ts" setup>
defineProps({
  active: Boolean,
});
</script>

<template>
  <button type="button" class="control-item" :class="{ active }">
    <slot />
  </button>
</template>

<style scoped>
.control-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: #b3b3de;
  cursor: pointer;
  padding: 0;
  transition:
    border-color 0.15s,
    color 0.15s,
    background 0.15s;
}

.control-item:hover {
  border-color: rgba(255, 255, 255, 0.6);
  color: #e8e6e3;
}

.control-item.active {
  border-color: #e2bc4e;
  color: #e2bc4e;
}
</style>
