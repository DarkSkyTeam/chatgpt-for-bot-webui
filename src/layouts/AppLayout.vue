<template>
  <div class="app-wrapper">
    <!-- <div class="top-bar-wrapper">
      <TopBar />
    </div> -->

    <div class="content-wrapper">
      <div class="sidebar-wrapper">
        <SideBar :navList="navList"/>
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

const navList: Nav[] = [
    {
        text: "总览",
        icon: "dashboard",
        path: "/dashboard",
    },
    {
        text: "接入平台",
        icon: "platforms",
        path: "/platforms",
    },
    {
        text: "接入 AI",
        icon: "llms",
        path: "/llms",
    },
    {
        text: "功能设置",
        icon: "utilites",
        path: "/utilites",
    },
    {
        text: "预设管理",
        icon: "presets",
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
  width: 256px;
  background-color: var(--vt-c-white-mute);
  padding: 16px;
}

.main-content-wrapper {
  flex-grow: 1;
  /* padding: 16px; */
}
</style>
