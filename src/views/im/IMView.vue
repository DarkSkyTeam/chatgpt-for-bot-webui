<script setup lang="ts">
import { imApi } from '@/api/im'
import type { IMAdapter } from '@/api/im'
import AdapterManager from '@/components/adapter/AdapterManager.vue'
import { ref } from 'vue';

const adapter = ref<IMAdapter>({
  name: '',
  adapter: '',
  config: {},
  is_running: false
})

const api = {
  getAdapterTypes: imApi.getAdapterTypes,
  getAdapters: imApi.getAdapters,
  getAdapterConfigSchema: imApi.getAdapterConfigSchema,
  createAdapter: imApi.createAdapter,
  updateAdapter: imApi.updateAdapter,
  deleteAdapter: imApi.deleteAdapter,
  toggleAdapter: async (name: string, running: boolean) => {
    if (running) {
      return imApi.startAdapter(name)
    } else {
      return imApi.stopAdapter(name)
    }
  }
}
</script>

<template>
  <adapter-manager
    title="聊天平台管理"
    :api="api"
    v-model="adapter"
  >
    <template #desc>
      <div class="im-view-description">
        在这里配置 Kirara AI 与聊天平台的连接方式，更多介绍请阅读<a href="https://kirara-docs.app.lss233.com/guide/configuration/im.html" target="_blank">官方文档</a>。
      </div>
    </template>
  </adapter-manager>
</template>

<style scoped>
.im-view-description {
  margin-bottom: 16px;
}
</style>