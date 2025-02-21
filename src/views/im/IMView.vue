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
  />
</template>

<style scoped>
.im-view {
  height: 100%;
}
</style>