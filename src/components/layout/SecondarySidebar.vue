<script setup lang="ts">
import { computed, h } from 'vue'
import { NMenu } from 'naive-ui'
import { RouterLink, useRoute } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

// 根据当前路由获取二级菜单配置
const menuOptions = computed<MenuOption[]>(() => {
  const currentPath = route.path.split('/')[1]
  
  switch (currentPath) {
    case 'im':
      return [
        {
          label: () => h(RouterLink, { to: '/im' }, { default: () => '平台管理' }),
          key: 'im-platforms'
        },
        // {
        //   label: () => h(RouterLink, { to: '/im/accounts' }, { default: () => '账号管理' }),
        //   key: 'im-accounts'
        // },
        // {
        //   label: () => h(RouterLink, { to: '/im/messages' }, { default: () => '消息记录' }),
        //   key: 'im-messages'
        // }
      ]
    case 'llm':
      return [
        {
          label: () => h(RouterLink, { to: '/llm' }, { default: () => '后端管理' }),
          key: 'llm-backends'
        },
        {
          label: () => h(RouterLink, { to: '/llm/models' }, { default: () => '模型管理' }),
          key: 'llm-models'
        },
        {
          label: () => h(RouterLink, { to: '/llm/chat' }, { default: () => '对话测试' }),
          key: 'llm-chat'
        }
      ]
    case 'workflow':
      return [
        {
          label: () => h(RouterLink, { to: '/workflow' }, { default: () => '工作流列表' }),
          key: 'workflow-list'
        },
        {
          label: () => h(RouterLink, { to: '/workflow/templates' }, { default: () => '模板管理' }),
          key: 'workflow-templates'
        }
      ]
    case 'plugins':
      return [
        {
          label: () => h(RouterLink, { to: '/plugins' }, { default: () => '已安装插件' }),
          key: 'plugins-installed'
        },
        {
          label: () => h(RouterLink, { to: '/plugins/market' }, { default: () => '插件市场' }),
          key: 'plugins-market'
        }
      ]
    case 'memory':
      return [
        {
          label: () => h(RouterLink, { to: '/memory' }, { default: () => '记忆管理' }),
          key: 'memory-list'
        },
        {
          label: () => h(RouterLink, { to: '/memory/search' }, { default: () => '记忆检索' }),
          key: 'memory-search'
        }
      ]
    default:
      return []
  }
})

// 当前选中的菜单项
const activeKey = computed(() => {
  const pathParts = route.path.split('/')
  if (pathParts.length > 2) {
    return `${pathParts[1]}-${pathParts[2]}`
  }
  return `${pathParts[1]}-${getDefaultSubModule(pathParts[1])}`
})

// 获取模块的默认子模块
const getDefaultSubModule = (module: string) => {
  switch (module) {
    case 'im':
      return 'platforms'
    case 'llm':
      return 'backends'
    case 'workflow':
      return 'list'
    case 'plugins':
      return 'installed'
    case 'memory':
      return 'list'
    default:
      return ''
  }
}
</script>

<template>
  <n-menu
    v-if="menuOptions.length > 0"
    :value="activeKey"
    :options="menuOptions"
    :collapsed="appStore.secondarySiderCollapsed"
  />
</template>

<style scoped>
:deep(.n-menu-item) {
  height: 40px;
}

:deep(.n-menu-item-content) {
  padding: 0 16px;
}

:deep(.n-menu-item-content-header) {
  font-size: 14px;
}
</style> 