<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NTabs, NTabPane, NIcon, NSpace } from 'naive-ui'
import { SettingsOutline, ServerOutline, ExtensionPuzzleOutline, LockClosedOutline } from '@vicons/ionicons5'
import WebServiceCard from './components/WebServiceCard.vue'
import PluginMarketCard from './components/PluginMarketCard.vue'
import UpdateRegistryCard from './components/UpdateRegistryCard.vue'
import PasswordCard from './components/PasswordCard.vue'
</script>

<template>
  <div class="settings-page">
    <n-card title="系统设置">
      <n-tabs type="line" animated class="settings-tabs">
        <n-tab-pane name="webservice" tab="Web服务">
          <n-space vertical :gap="32">
            <WebServiceCard />
            <PasswordCard />
          </n-space>
        </n-tab-pane>
        
        <n-tab-pane name="update" tab="下载源">
          <n-space vertical :gap="32">
            <UpdateRegistryCard />
            <PluginMarketCard />
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<style scoped>
.settings-page {
  height: 100%;
  padding: 24px;
  background-color: var(--bg-color);
}

.settings-card {
  max-width: 1000px;
  margin: 0 auto;
  animation: fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-tabs {
  margin-top: 16px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.n-tabs-nav) {
  padding: 0 16px;
}

:deep(.n-tabs-tab) {
  padding: 12px 16px;
}

:deep(.n-tabs-tab.n-tabs-tab--active) {
  color: var(--primary-color);
  font-weight: 500;
}

:deep(.n-tabs-bar) {
  background-color: var(--primary-color);
}

@media (max-width: 768px) {
  .settings-page {
    padding: 16px;
  }
  
  .settings-card {
    max-width: 100%;
  }
}
</style> 