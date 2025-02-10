<script setup lang="ts">
import { ref } from 'vue'
import { NFormItem, NSwitch } from 'naive-ui'
import { llmApi } from '@/api/llm'
import type { LLMBackend } from '@/api/llm'
import AdapterManager from '@/components/adapter/AdapterManager.vue'
import ModelListForm from '@/components/form/ModelListForm.vue'

const defaultFormModel = {
  enable: true,
  models: []
}

const transformFormModel = (model: any) => {
  return {
    ...model,
    models: Array.isArray(model.models) ? model.models : []
  }
}
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
    :default-form-model="defaultFormModel"
    :transform-form-model="transformFormModel"
  >
    <template #extra-form-items="{ model }">
      <n-form-item label="启用状态" path="enable">
        <n-switch v-model:value="model.enable" />
      </n-form-item>
      <n-form-item label="支持模型" path="models">
        <model-list-form v-model:value="model.models" />
      </n-form-item>
    </template>
  </adapter-manager>
</template>

<style scoped>
.llm-view {
  height: 100%;
}
</style>