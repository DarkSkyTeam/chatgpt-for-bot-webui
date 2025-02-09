<script setup lang="ts">
import { computed, h } from 'vue'
import { NMenu } from 'naive-ui'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()
const router = useRouter()

// 根据当前路由获取二级菜单配置
const menuOptions = computed<MenuOption[]>(() => {
  const currentPath = route.path.split('/')[1]
  
  switch (currentPath) {
    case 'im':
      return [
        {
          label: () => '平台管理',
          key: 'im-platforms',
          path: '/im'
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
          label: () => '后端管理',
          key: 'llm-backends',
          path: '/llm'
        },
        {
          label: () => '模型管理',
          key: 'llm-models',
          path: '/llm/models'
        },
        {
          label: () => '对话测试',
          key: 'llm-chat',
          path: '/llm/chat'
        }
      ]
    case 'workflow':
      return [
        {
          label: () => '工作流列表',
          key: 'workflow-list',
          path: '/workflow'
        },
        {
          label: () => '模板管理',
          key: 'workflow-templates',
          path: '/workflow/templates'
        },
        {
          label: () => '调度规则',
          key: 'workflow-dispatch-rules',
          path: '/workflow/dispatch-rules'
        }
      ]
    case 'plugins':
      return [
        {
          label: () => '已安装插件',
          key: 'plugins-installed',
          path: '/plugins'
        },
        {
          label: () => '插件市场',
          key: 'plugins-market',
          path: '/plugins/market'
        }
      ]
    case 'memory':
      return [
        {
          label: () => '记忆管理',
          key: 'memory-list',
          path: '/memory'
        },
        {
          label: () => '记忆检索',
          key: 'memory-search',
          path: '/memory/search'
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

// 监听菜单变化，更新当前路由
const handleUpdateValue = (key: string) => {
  const selectedMenu = menuOptions.value.find(option => option.key === key);
  if (selectedMenu && selectedMenu.path) {
    router.push(selectedMenu.path);
  }
}
</script>

<template>
  <n-menu
    v-if="menuOptions.length > 0"
    :value="activeKey"
    :options="menuOptions"
    :collapsed="appStore.secondarySiderCollapsed"
    @update:value="handleUpdateValue"
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