<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NCard, NSpace, NButton, NDataTable, NModal, NForm, NFormItem, NInput, NSelect, NSwitch } from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import { imApi } from '@/api/im'
import type { IMAdapter } from '@/api/im'

const formRef = ref<FormInst | null>(null)
const showModal = ref(false)
const modalType = ref<'create' | 'edit'>('create')
const adapterTypes = ref<string[]>([])
const adapters = ref<IMAdapter[]>([])

const formModel = ref<Omit<IMAdapter, 'is_running'>>({
  name: '',
  adapter: '',
  config: {}
})

// 获取适配器类型
const fetchAdapterTypes = async () => {
  try {
    const { types } = await imApi.getAdapterTypes()
    adapterTypes.value = types
  } catch (error) {
    console.error('获取适配器类型失败:', error)
  }
}

// 获取所有适配器
const fetchAdapters = async () => {
  try {
    const { adapters: list } = await imApi.getAdapters()
    adapters.value = list
  } catch (error) {
    console.error('获取适配器列表失败:', error)
  }
}

// 创建或更新适配器
const handleSubmit = async () => {
  try {
    if (modalType.value === 'create') {
      await imApi.createAdapter(formModel.value)
    } else {
      await imApi.updateAdapter(formModel.value.name, formModel.value)
    }
    showModal.value = false
    await fetchAdapters()
  } catch (error) {
    console.error('保存适配器失败:', error)
  }
}

// 删除适配器
const handleDelete = async (adapter: IMAdapter) => {
  if (confirm(`确定要删除适配器 ${adapter.name} 吗？`)) {
    try {
      await imApi.deleteAdapter(adapter.name)
      await fetchAdapters()
    } catch (error) {
      console.error('删除适配器失败:', error)
    }
  }
}

// 启动/停止适配器
const handleToggleRunning = async (adapter: IMAdapter) => {
  try {
    if (adapter.is_running) {
      await imApi.stopAdapter(adapter.name)
    } else {
      await imApi.startAdapter(adapter.name)
    }
    await fetchAdapters()
  } catch (error) {
    console.error('切换适配器状态失败:', error)
  }
}

const createColumns = (): DataTableColumns<IMAdapter> => {
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
      key: 'is_running',
      render(row) {
        return h(
          NSwitch,
          {
            value: row.is_running,
            onUpdateValue: () => handleToggleRunning(row)
          }
        )
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
    }
  ]
}

onMounted(() => {
  fetchAdapterTypes()
  fetchAdapters()
})
</script>

<template>
  <div class="im-view">
    <n-space vertical :size="16">
      <n-card title="IM 适配器管理">
        <template #header-extra>
          <n-button
            type="primary"
            @click="() => {
              modalType = 'create'
              formModel = {
                name: '',
                adapter: '',
                config: {}
              }
              showModal = true
            }"
          >
            添加适配器
          </n-button>
        </template>
        <n-data-table :columns="createColumns()" :data="adapters" />
      </n-card>
    </n-space>

    <!-- 创建/编辑适配器表单 -->
    <n-modal v-model:show="showModal" :title="modalType === 'create' ? '添加适配器' : '编辑适配器'">
      <n-form ref="formRef" :model="formModel" label-placement="left" label-width="100">
        <n-form-item label="名称" path="name">
          <n-input v-model:value="formModel.name" placeholder="请输入适配器名称" />
        </n-form-item>
        <n-form-item label="适配器" path="adapter">
          <n-select v-model:value="formModel.adapter" :options="adapterTypes.map(type => ({ label: type, value: type }))" />
        </n-form-item>
        <n-form-item v-for="(value, key) in formModel.config" :key="key" :label="key">
          <n-input v-model:value="formModel.config[key]" />
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
.im-view {
  height: 100%;
}
</style> 