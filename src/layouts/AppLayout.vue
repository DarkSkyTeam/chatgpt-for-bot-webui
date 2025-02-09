<template>
  <n-layout has-sider position="absolute">
    <!-- 左侧主导航栏 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed="appStore.siderCollapsed"
      :collapsed-width="64"
      :width="240"
      show-trigger
      @collapse="appStore.toggleSider"
      @expand="appStore.toggleSider"
      class="main-sider"
    >
      <main-sidebar />
    </n-layout-sider>
    <!-- 二级菜单栏 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed="appStore.secondarySiderCollapsed"
      :collapsed-width="0"
      :width="240"
      show-trigger
      @collapse="appStore.toggleSecondarySider"
      @expand="appStore.toggleSecondarySider"
      class="secondary-sider"
    >
      <secondary-sidebar />
    </n-layout-sider>

    <!-- 主内容区域 -->
    <n-layout>
      <n-layout-content class="main-content">
        <router-view />
      </n-layout-content>
      <!-- 底部状态栏 -->
      <n-layout-footer bordered position="absolute" class="status-bar">
        <status-bar />
      </n-layout-footer>
    </n-layout>
  </n-layout>
</template>
  
<script setup lang="ts">
import { NLayout, NLayoutSider, NLayoutContent, NLayoutFooter } from 'naive-ui'
import { RouterView } from 'vue-router'
import { useAppStore } from '@/stores/app'
import MainSidebar from '@/components/layout/MainSidebar.vue'
import SecondarySidebar from '@/components/layout/SecondarySidebar.vue' 
import StatusBar from '@/components/layout/StatusBar.vue'

const appStore = useAppStore()
</script>

<style scoped>
.main-sider {
  height: 100vh;
  background: var(--n-color);
}

.secondary-sider {
  height: 100vh;
  background: var(--n-color);
}

.main-content {
  padding: 16px;
  height: calc(100vh - 28px); /* 减去状态栏高度 */
}

.status-bar {
  height: 28px;
  padding: 4px 12px;
  font-size: 12px;
  line-height: 20px;
}
</style>
