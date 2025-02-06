<script setup lang="ts">
import { computed, h } from 'vue'
import { NMenu } from 'naive-ui'
import { RouterLink, useRoute } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import {
  ChatboxOutline,
  ServerOutline,
  ExtensionPuzzleOutline,
  GitNetworkOutline,
  BookOutline
} from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const appStore = useAppStore()

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/im'
        },
        { default: () => 'IM 管理' }
      ),
    key: 'im',
    icon: renderIcon(ChatboxOutline)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/llm'
        },
        { default: () => 'LLM 管理' }
      ),
    key: 'llm',
    icon: renderIcon(ServerOutline)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/workflow'
        },
        { default: () => 'Workflow' }
      ),
    key: 'workflow',
    icon: renderIcon(GitNetworkOutline)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: '/plugins'
        },
        { default: () => '插件管理' }
      ),
    key: 'plugins',
    icon: renderIcon(ExtensionPuzzleOutline)
  }
]

// 当前选中的菜单项
const activeKey = computed(() => route.path.split('/')[1])

// 监听路由变化，更新当前模块
const handleUpdateValue = (key: string) => {
  appStore.setCurrentModule(key)
}
</script>

<template>
  <n-menu
    :value="activeKey"
    :options="menuOptions"
    :collapsed="appStore.siderCollapsed"
    :collapsed-width="64"
    :collapsed-icon-size="22"
    @update:value="handleUpdateValue"
  />
</template>

<style scoped>
:deep(.n-menu-item) {
  height: 48px;
}

:deep(.n-menu-item-content) {
  padding: 0 12px;
}

:deep(.n-menu-item-content__icon) {
  font-size: 20px;
}

:deep(.n-menu-item-content-header) {
  font-size: 14px;
}
</style> 