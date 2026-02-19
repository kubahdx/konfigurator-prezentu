<script setup>
import { ref } from 'vue';
import BoxConfigurator from './components/BoxConfigurator.vue'
import SimpleConfigurator from './components/SimpleConfigurator.vue'
import ModeSelection from './components/ModeSelection.vue'
import TutorialOverlay from './components/TutorialOverlay.vue'

const currentMode = ref('selection'); // 'selection', '3d', 'simple'

const setMode = (mode) => {
    currentMode.value = mode;
};
</script>

<template>
  <ModeSelection 
    v-if="currentMode === 'selection'" 
    @select-mode="setMode" 
  />
  
  <template v-else>
      <button class="global-back-btn" @click="setMode('selection')">
        ← Menu
      </button>

      <template v-if="currentMode === '3d'">
          <BoxConfigurator />
          <TutorialOverlay />
      </template>

      <SimpleConfigurator v-else-if="currentMode === 'simple'" />
  </template>
</template>

<style scoped>
.global-back-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1000;
    padding: 10px 20px;
    background: white;
    color: #1f2937;
    border: 1px solid #e5e7eb;
    border-radius: 30px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
}

.global-back-btn:hover {
    background: #f9fafb;
    transform: translateX(-2px);
}
</style>
