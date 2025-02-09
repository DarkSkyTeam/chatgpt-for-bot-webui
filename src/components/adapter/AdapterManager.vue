<script setup lang="ts">
import { ref, onMounted, h, watch } from 'vue'
import { NCard, NSpace, NButton, NDataTable, NModal, NForm, NFormItem, NInput, NSelect, NSwitch, NSpin } from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import DynamicConfigForm from '@/components/form/DynamicConfigForm.vue'

interface AdapterBase {
  name: string
  adapter: string
  config: Record<string, any>
}

interface Props {
  title: string
  api: {
    getAdapterTypes: () => Promise<{ types: string[] }>
    getAdapters: () => Promise<{ adapters?: any[], data?: { backends: any[] } }>
    getAdapterConfigSchema: (type: string) => Promise<{ configSchema: any }>
    createAdapter: (data: any) => Promise<any>
    updateAdapter: (name: string, data: any) => Promise<any>
    deleteAdapter: (name: string) => Promise<any>
    toggleAdapter?: (name: string, running: boolean) => Promise<any>
  }
  extraFormItems?: any
  transformFormModel?: (model: any) => any
}

const props = defineProps<Props>()

const formRef = ref<FormInst | null>(null)
const showModal = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const adapterTypes = ref<string[]>([])
const adapters = ref<any[]>([])
const configSchema = ref<any>(null)
const loading = ref(false)

const formModel = ref<AdapterBase>({
  name: '',
  adapter: '',
  config: {}
})

// 获取适配器类型
const fetchAdapterTypes = async () => {
  try {
    const { types } = await props.api.getAdapterTypes()
    adapterTypes.value = types
  } catch (error) {
    console.error('获取适配器类型失败:', error)
  }
}

// 获取所有适配器
const fetchAdapters = async () => {
  try {
    const response = await props.api.getAdapters()
    adapters.value = response.adapters || response.data?.backends || []
  } catch (error) {
    console.error('获取适配器列表失败:', error)
  }
}

// 获取适配器配置模式
const fetchAdapterConfigSchema = async (adapterType: string) => {
  try {
    loading.value = true
    const { configSchema: configSchemaData } = await props.api.getAdapterConfigSchema(adapterType)
    configSchema.value = configSchemaData

  } catch (error) {
    console.error('获取适配器配置模式失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听适配器类型变化
watch(() => formModel.value.adapter, async (newAdapter) => {
  if (newAdapter) {
    if (modalType.value != 'edit') {
      formModel.value = { name: '', adapter: newAdapter, config: {} }
    }
    await fetchAdapterConfigSchema(newAdapter)
  }
})

// 监听模态框显示状态
watch(showModal, async (show) => {
  if (show) {
    if (formModel.value.adapter) {
      await fetchAdapterConfigSchema(formModel.value.adapter)
    } else {
      configSchema.value = null
    }
  }
})

// 创建或更新适配器
const handleSubmit = async () => {
  try {
    const submitData = props.transformFormModel ? props.transformFormModel(formModel.value) : formModel.value
    if (modalType.value === 'create') {
      await props.api.createAdapter(submitData)
    } else {
      await props.api.updateAdapter(submitData.name, submitData)
    }
    showModal.value = false
    await fetchAdapters()
  } catch (error) {
    console.error('保存适配器失败:', error)
  }
}

// 删除适配器
const handleDelete = async (adapter: any) => {
  if (confirm(`确定要删除适配器 ${adapter.name} 吗？`)) {
    try {
      await props.api.deleteAdapter(adapter.name)
      await fetchAdapters()
    } catch (error) {
      console.error('删除适配器失败:', error)
    }
  }
}

// 切换适配器状态
const handleToggleAdapter = async (adapter: any) => {
  if (props.api.toggleAdapter) {
    try {
      await props.api.toggleAdapter(adapter.name, !adapter.is_running)
      await fetchAdapters()
    } catch (error) {
      console.error('切换适配器状态失败:', error)
    }
  }
}

const createColumns = (): DataTableColumns<any> => {
  const columns: DataTableColumns<any> = [
    {
      title: '名称',
      key: 'name'
    },
    {
      title: '适配器',
      key: 'adapter'
    }
  ]

  if (props.api.toggleAdapter) {
    columns.push({
      title: '状态',
      key: 'is_running',
      render(row) {
        return h(
          NSwitch,
          {
            value: row.is_running,
            onUpdateValue: () => handleToggleAdapter(row)
          }
        )
      }
    })
  }

  columns.push({
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
                  formModel.value = {
                    name: row.name,
                    adapter: row.adapter,
                    config: { ...row.config }
                  }
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
  })

  return columns
}

onMounted(() => {
  fetchAdapterTypes()
  fetchAdapters()
})
</script>

<template>
  <div class="adapter-manager">
    <n-space vertical :size="16">
      <n-card :title="title">
        <template #header-extra>
          <n-button type="primary" @click="() => {
            modalType = 'create'
            formModel = {
              name: '',
              adapter: '',
              config: {}
            }
            showModal = true
          }">
            添加适配器
          </n-button>
        </template>
        <n-data-table :columns="createColumns()" :data="adapters" />
      </n-card>
    </n-space>

    <!-- 创建/编辑适配器表单 -->
    <n-modal v-model:show="showModal">
      <n-card style="width: 600px" :title="modalType === 'create' ? '添加适配器' : '编辑适配器'" :bordered="false" size="huge"
        role="dialog" aria-modal="true">
        <n-form ref="formRef" :model="formModel" label-placement="left" label-width="100">
          <n-form-item label="名称" path="name">
            <n-input v-model:value="formModel.name" placeholder="请输入适配器名称" />
          </n-form-item>
          <n-form-item label="适配器" path="adapter">
            <n-select v-model:value="formModel.adapter" :options="adapterTypes.map(type => ({ label: type, value: type }))" />
          </n-form-item>
          <n-spin :show="loading">
            <dynamic-config-form :schema="configSchema" v-model="formModel.config" v-if="configSchema"/>
          </n-spin>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showModal = false">取消</n-button>
            <n-button type="primary" @click="handleSubmit">确定</n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<style scoped>
.adapter-manager {
  height: 100%;
}
</style>