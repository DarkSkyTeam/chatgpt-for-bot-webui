<script setup lang="ts">
import { ref, watch } from 'vue'
import { NFormItem, NSwitch, NButton, NSpace, NModal, NCard, useMessage } from 'naive-ui'
import { llmApi } from '@/api/llm'
import type { LLMBackend } from '@/api/llm'
import AdapterManager from '@/components/adapter/AdapterManager.vue'
import ModelListForm from '@/components/form/ModelListForm.vue'
const adapterManagerRef = ref<InstanceType<typeof AdapterManager> | null>(null)
const $message = useMessage()
const isAutoDetectModelsSupported = ref(false)
const adapter = ref<LLMBackend>({
  name: '',
  adapter: '',
  config: {},
  enable: true,
  models: []
})

const transformFormModel = (model: any) => {
  return {
    ...model,
    models: Array.isArray(model.models) ? model.models : []
  }
}

const showConfirmModal = ref(false)
const autoDetectLoading = ref(false)

const handleAutoDetectModels = async () => {
  showConfirmModal.value = true
}

const confirmAutoDetect = async () => {
  autoDetectLoading.value = true
  try {
    await adapterManagerRef.value?.handleSubmitActual()
    adapter.value.models = (await llmApi.getBackendModels(adapter.value.name)).models
  } catch (error: any) {
    // 显示错误信息
    $message.error(`自动检测模型失败: ${error.message || error}`)
  } finally {
    autoDetectLoading.value = false
    showConfirmModal.value = false
  }
}

const cancelAutoDetect = () => {
  showConfirmModal.value = false
}

// 监听适配器类型变化
watch(() => adapter.value, async (newAdapter) => {
  if (newAdapter.adapter && newAdapter.name) {
    console.log(newAdapter)
    isAutoDetectModelsSupported.value = (
      await llmApi.getAdapterSupportsAutoDetectModels(newAdapter.adapter)
    ).supportsAutoDetectModels
  }
})

const api = {
  getAdapterTypes: llmApi.getAdapterTypes,
  getAdapters: llmApi.getBackends,
  getAdapterConfigSchema: llmApi.getAdapterConfigSchema,
  createAdapter: llmApi.createBackend,
  updateAdapter: llmApi.updateBackend,
  deleteAdapter: llmApi.deleteBackend
}

</script>
<template>
  <adapter-manager
    title="模型管理"
    :api="api"
    :transform-form-model="transformFormModel"
    v-model="adapter"
    ref="adapterManagerRef"
  >
    <template #desc>
      <div class="llm-view-description">
        在这里配置 Kirara AI 的模型，更多介绍请阅读<a href="https://kirara-docs.app.lss233.com/guide/configuration/llm.html" target="_blank">官方文档</a>。
      </div>
    </template>
    <template #extra-form-items="{ model }">
      <n-form-item label="开启" path="enable">
        <n-switch v-model:value="model.enable" />
      </n-form-item>
      <n-form-item label="支持模型" path="models">
        <n-space vertical>
          <n-button
            type="primary"
            @click="handleAutoDetectModels"
            v-if="isAutoDetectModelsSupported"
            :loading="autoDetectLoading"
          >
            自动检测模型
          </n-button>
          <model-list-form v-model:value="model.models" />
        </n-space>
      </n-form-item>
    </template>
  </adapter-manager>

  <n-modal v-model:show="showConfirmModal">
    <n-card
      style="width: 400px"
      title="确认"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <div>自动检测前会自动保存当前配置，请确保 API 信息正确填写，然后点击继续。</div>
      <n-space justify="end" style="margin-top: 24px;">
        <n-button @click="cancelAutoDetect">取消</n-button>
        <n-button type="primary" @click="confirmAutoDetect" :loading="autoDetectLoading">
          继续
        </n-button>
      </n-space>
    </n-card>
  </n-modal>
</template>

<style scoped>
.llm-view-description {
  margin-bottom: 16px;
}
</style>