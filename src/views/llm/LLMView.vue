<script setup lang="ts">
import { h } from 'vue'
import { NFormItem, NInput, NSwitch } from 'naive-ui'
import { llmApi } from '@/api/llm'
import type { LLMBackend } from '@/api/llm'
import AdapterManager from '@/components/adapter/AdapterManager.vue'

const transformFormModel = (model: any) => {
  return {
    ...model,
    enable: true,
    models: (model.models || [])
  }
}

const extraFormItems = () => [
  h(NFormItem, { label: '启用状态', path: 'enable' }, () => h(NSwitch, { value: true })),
  h(NFormItem, { label: '支持模型', path: 'models' }, () => h(NInput, { type: 'textarea', placeholder: '每行一个模型名称' }))
]
</script>

<template>
  <adapter-manager
    title="LLM 后端管理"
    :api="{
      getAdapterTypes: llmApi.getAdapterTypes,
      getAdapters: llmApi.getBackends,
      getAdapterConfigSchema: llmApi.getAdapterConfigSchema,
      createAdapter: llmApi.createBackend,
      updateAdapter: llmApi.updateBackend,
      deleteAdapter: llmApi.deleteBackend
    }"
    :transform-form-model="transformFormModel"
  >
    <template #extra-form-items>
      <component :is="extraFormItems()" />
    </template>
  </adapter-manager>
</template>

<style scoped>
.llm-view {
  height: 100%;
}
</style>