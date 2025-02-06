<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard, NSpace, NButton, NDataTable, NTag, NSwitch, NModal, NForm, NFormItem, NInput } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useRouter } from 'vue-router'

interface PluginInfo {
  name: string
  package_name: string
  description: string
  version: string
  author: string
  homepage?: string
  license?: string
  is_internal: boolean
  is_enabled: boolean
  metadata?: {
    category?: string
    tags?: string[]
  }
}

const router = useRouter()
const plugins = ref<PluginInfo[]>([])
const showInstallModal = ref(false)
const installForm = ref({
  package_name: '',
  version: ''
})

// 获取所有插件
const fetchPlugins = async () => {
  try {
    const response = await fetch('/backend-api/api/plugin/plugins')
    const data = await response.json()
    plugins.value = data.plugins
  } catch (error) {
    console.error('获取插件列表失败:', error)
  }
}

// 安装插件
const handleInstall = async () => {
  try {
    const response = await fetch('/backend-api/api/plugin/plugins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(installForm.value)
    })
    
    if (response.ok) {
      showInstallModal.value = false
      await fetchPlugins()
    }
  } catch (error) {
    console.error('安装插件失败:', error)
  }
}

// 卸载插件
const handleUninstall = async (plugin: PluginInfo) => {
  if (plugin.is_internal) {
    alert('内部插件不能卸载')
    return
  }
  
  if (confirm(`确定要卸载插件 ${plugin.name} 吗？`)) {
    try {
      const response = await fetch(`/api/plugin/plugins/${plugin.package_name}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchPlugins()
      }
    } catch (error) {
      console.error('卸载插件失败:', error)
    }
  }
}

// 启用/禁用插件
const handleToggleEnable = async (plugin: PluginInfo) => {
  try {
    const action = plugin.is_enabled ? 'disable' : 'enable'
    const response = await fetch(`/api/plugin/plugins/${plugin.package_name}/${action}`, {
      method: 'POST'
    })
    
    if (response.ok) {
      await fetchPlugins()
    }
  } catch (error) {
    console.error('切换插件状态失败:', error)
  }
}

// 更新插件
const handleUpdate = async (plugin: PluginInfo) => {
  if (plugin.is_internal) {
    alert('内部插件不支持更新')
    return
  }
  
  try {
    const response = await fetch(`/api/plugin/plugins/${plugin.package_name}`, {
      method: 'PUT'
    })
    
    if (response.ok) {
      await fetchPlugins()
    }
  } catch (error) {
    console.error('更新插件失败:', error)
  }
}

const createColumns = (): DataTableColumns<PluginInfo> => {
  return [
    {
      title: '名称',
      key: 'name',
      render(row) {
        return h(
          'div',
          {},
          [
            h('div', {}, row.name),
            h('div', { style: 'font-size: 12px; color: var(--n-text-color-3);' }, row.package_name)
          ]
        )
      }
    },
    {
      title: '描述',
      key: 'description'
    },
    {
      title: '版本',
      key: 'version'
    },
    {
      title: '作者',
      key: 'author'
    },
    {
      title: '类型',
      key: 'is_internal',
      render(row) {
        return h(
          NTag,
          {
            type: row.is_internal ? 'info' : 'success'
          },
          { default: () => row.is_internal ? '内部插件' : '第三方插件' }
        )
      }
    },
    {
      title: '状态',
      key: 'is_enabled',
      render(row) {
        return h(
          NSwitch,
          {
            value: row.is_enabled,
            onUpdateValue: () => handleToggleEnable(row)
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
                  disabled: row.is_internal,
                  onClick: () => handleUpdate(row)
                },
                { default: () => '更新' }
              ),
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  disabled: row.is_internal,
                  onClick: () => handleUninstall(row)
                },
                { default: () => '卸载' }
              )
            ]
          }
        )
      }
    }
  ]
}

onMounted(() => {
  fetchPlugins()
})
</script>

<template>
  <div class="plugin-list">
    <n-space vertical :size="16">
      <n-space>
        <n-button type="primary" @click="showInstallModal = true">安装插件</n-button>
        <n-button @click="router.push('/plugins/market')">插件市场</n-button>
      </n-space>
      
      <n-card title="已安装插件">
        <n-data-table :columns="createColumns()" :data="plugins" />
      </n-card>
    </n-space>

    <!-- 安装插件表单 -->
    <n-modal v-model:show="showInstallModal" title="安装插件">
      <n-form :model="installForm" label-placement="left" label-width="100">
        <n-form-item label="包名" path="package_name">
          <n-input v-model:value="installForm.package_name" placeholder="请输入插件包名" />
        </n-form-item>
        <n-form-item label="版本" path="version">
          <n-input v-model:value="installForm.version" placeholder="请输入版本号（可选）" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showInstallModal = false">取消</n-button>
          <n-button type="primary" @click="handleInstall">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.plugin-list {
  height: 100%;
}
</style> 