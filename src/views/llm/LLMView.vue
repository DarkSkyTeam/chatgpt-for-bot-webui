<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard, NSpace, NButton, NDataTable, NModal, NForm, NFormItem, NInput, NSelect, NSwitch } from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'

interface LLMBackend {
  name: string
  adapter: string
  config: Record<string, any>
  enable: boolean
  models: string[]
}

interface AdapterConfig {
  api_key?: string
  api_base?: string
  temperature?: number
  model_path?: string
  device?: string
  deployment_name?: string
}

const formRef = ref<FormInst | null>(null)
const showModal = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const adapterTypes = ref<string[]>([])
const backends = ref<LLMBackend[]>([])

const formModel = ref<LLMBackend>({
  name: '',
  adapter: '',
  config: {},
  enable: true,
  models: []
})

// 获取适配器类型
const fetchAdapterTypes = async () => {
  try {
    const response = await fetch('/backend-api/api/llm/types')
    const data = await response.json()
    adapterTypes.value = data.types
  } catch (error) {
    console.error('获取适配器类型失败:', error)
  }
}

// 获取所有后端
const fetchBackends = async () => {
  try {
    const response = await fetch('/backend-api/api/llm/backends')
    const data = await response.json()
    backends.value = data.data.backends
  } catch (error) {
    console.error('获取后端列表失败:', error)
  }
}

// 创建或更新后端
const handleSubmit = async () => {
  try {
    const url = modalType.value === 'create' ? '/backend-api/api/llm/backends' : `/api/llm/backends/${formModel.value.name}`
    const method = modalType.value === 'create' ? 'POST' : 'PUT'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formModel.value)
    })
    
    if (response.ok) {
      showModal.value = false
      await fetchBackends()
    }
  } catch (error) {
    console.error('保存后端失败:', error)
  }
}

// 删除后端
const handleDelete = async (backend: LLMBackend) => {
  if (confirm(`确定要删除后端 ${backend.name} 吗？`)) {
    try {
      const response = await fetch(`/api/llm/backends/${backend.name}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchBackends()
      }
    } catch (error) {
      console.error('删除后端失败:', error)
    }
  }
}

const createColumns = (): DataTableColumns<LLMBackend> => {
  return [
    {
      title: '名称',
      key: 'name'
    },
    {
      title: '适配器',
      key: 'adapter'
    },
    {
      title: '状态',
      key: 'enable',
      render(row) {
        return row.enable ? '已启用' : '已禁用'
      }
    },
    {
      title: '支持模型',
      key: 'models',
      render(row) {
        return row.models.join(', ')
      }
    },
    {
      title: '操作',
      key: 'actions',
      render(row) {
        return h(
          NSpace,
          {},
          {
            default: () => [
              h(
                NButton,
                {
                  size: 'small',
                  onClick: () => {
                    modalType.value = 'edit'
                    formModel.value = { ...row }
                    showModal.value = true
                  }
                },
                { default: () => '编辑' }
              ),
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  onClick: () => handleDelete(row)
                },
                { default: () => '删除' }
              )
            ]
          }
        )
      }
    }
  ]
}

onMounted(() => {
  fetchAdapterTypes()
  fetchBackends()
})
</script>

<template>
  <div class="llm-view">
    <n-space vertical :size="16">
      <n-card title="LLM 后端管理">
        <template #header-extra>
          <n-button
            type="primary"
            @click="() => {
              modalType = 'create'
              formModel = {
                name: '',
                adapter: '',
                config: {},
                enable: true,
                models: []
              }
              showModal = true
            }"
          >
            添加后端
          </n-button>
        </template>
        <n-data-table :columns="createColumns()" :data="backends" />
      </n-card>
    </n-space>

    <!-- 创建/编辑表单 -->
    <n-modal v-model:show="showModal" :title="modalType === 'create' ? '添加后端' : '编辑后端'">
      <n-form ref="formRef" :model="formModel" label-placement="left" label-width="100">
        <n-form-item label="名称" path="name">
          <n-input v-model:value="formModel.name" placeholder="请输入后端名称" />
        </n-form-item>
        <n-form-item label="适配器" path="adapter">
          <n-select v-model:value="formModel.adapter" :options="adapterTypes.map(type => ({ label: type, value: type }))" />
        </n-form-item>
        <n-form-item label="API密钥" path="config.api_key" v-if="formModel.adapter !== 'local'">
          <n-input v-model:value="formModel.config.api_key" type="password" placeholder="请输入API密钥" />
        </n-form-item>
        <n-form-item label="API地址" path="config.api_base" v-if="formModel.adapter !== 'local'">
          <n-input v-model:value="formModel.config.api_base" placeholder="请输入API地址" />
        </n-form-item>
        <n-form-item label="模型路径" path="config.model_path" v-if="formModel.adapter === 'local'">
          <n-input v-model:value="formModel.config.model_path" placeholder="请输入模型路径" />
        </n-form-item>
        <n-form-item label="设备" path="config.device" v-if="formModel.adapter === 'local'">
          <n-select
            v-model:value="formModel.config.device"
            :options="[
              { label: 'CPU', value: 'cpu' },
              { label: 'CUDA', value: 'cuda' }
            ]"
          />
        </n-form-item>
        <n-form-item label="启用状态" path="enable">
          <n-switch v-model:value="formModel.enable" />
        </n-form-item>
        <n-form-item label="支持模型" path="models">
          <n-input v-model:value="formModel.models" type="textarea" placeholder="每行一个模型名称" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.llm-view {
  height: 100%;
}
</style> 