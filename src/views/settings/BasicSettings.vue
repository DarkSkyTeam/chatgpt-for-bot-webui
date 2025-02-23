<script setup lang="ts">
import WebServiceCard from './components/WebServiceCard.vue'
import PluginMarketCard from './components/PluginMarketCard.vue'
import UpdateRegistryCard from './components/UpdateRegistryCard.vue'
import PasswordCard from './components/PasswordCard.vue'
</script>

<template>
  <div class="settings-page">
    <div class="settings-container">
      <WebServiceCard />
      <PasswordCard />
      <PluginMarketCard />
      <UpdateRegistryCard />
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  height: 100%;
  padding: 24px;
  background-color: var(--n-color-modal);
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}
</style> 