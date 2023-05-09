<template>
  <div class="app-wrapper">
    <!-- <div class="top-bar-wrapper">
      <TopBar />
    </div> -->

    <div class="content-wrapper">
      <div class="sidebar-wrapper">
        <SideBar :navList="navList" :icon-only="true"/>
      </div>
      <div class="main-content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import TopBar from '@/components/TopBar.vue'
import SideBar, {Nav} from '@/components/Sidebar.vue'
import { h, Component } from 'vue'
import { NIcon, useMessage } from 'naive-ui'
import { AlbumsOutline, BarChartOutline, ChatboxOutline, IdCardOutline, SettingsOutline } from '@vicons/ionicons5';

const navList: Nav[] = [
    {
        text: "总览",
        icon: h(NIcon, null, { default: () => h(BarChartOutline) }),
        path: "/dashboard",
    },
    {
        text: "接入平台",
        icon: h(NIcon, null, { default: () => h(ChatboxOutline)}),
        path: "/platforms",
    },
    {
        text: "账号管理",
        icon: h(NIcon, null, { default: () => h(IdCardOutline)}),
        path: "/accounts",
    },
    {
        text: "功能设置",
        icon: h(NIcon, null, { default: () => h(SettingsOutline)}),
        path: "/utilites",
    },
    {
        text: "预设管理",
        icon: h(NIcon, null, { default: () => h(AlbumsOutline)}),
        path: "/presets",
    }
]
</script>

<style scoped>
.app-wrapper {
  /* display: flex; */
  /* flex-direction: column; */
  height: 100vh;
}

.content-wrapper {
  display: flex;
  flex-grow: 1;
  /* padding-top: 60px; */
  height: 100vh;
}

.sidebar-wrapper {
  /* width: 256px; */
  background-color: var(--vt-c-white-mute);
}

.main-content-wrapper {
  flex-grow: 1;
  /* padding: 16px; */
}
</style>
