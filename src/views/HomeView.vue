<script setup lang="ts">
import ConfigurationList from '@/components/ConfigurationList.vue'
import { useRouter } from 'vue-router'

import TheWelcome from '@/components/TheWelcome.vue'
import SideBar, { Nav } from '@/components/Sidebar.vue'

const $router = useRouter()

const navList: Nav[] = [
  {
    text: "OneBot",
    icon: "onebot",
    path: "/platforms/onebot",
  },
  {
    text: "Telegram",
    icon: "onebot",
    path: "/platforms/telegram",
  },
  {
    text: "Discord",
    icon: "onebot",
    path: "/platforms/discord",
  },
  {
    text: "企业微信",
    icon: "onebot",
    path: "/platforms/wecom",
  },
  {
    text: "HTTP 接口",
    icon: "http",
    path: "/platforms/http",
  }
]
</script>

<template>
  <div class="sub-content-wrapper">
    <div class="sidebar-wrapper">
      <SideBar :nav-list="navList" />
    </div>
    <div class="sub-main-content-wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>
<style scoped>
.sub-content-wrapper {
  display: flex;
  flex-grow: 1;
  height: 100%;
}

.sidebar-wrapper {
  width: 256px;
  background-color: var(--vt-c-gray);
  padding: 16px;
}

.sub-main-content-wrapper {
  flex-grow: 1;
  /* padding: 16px; */
  overflow-y: scroll;
}
</style>
