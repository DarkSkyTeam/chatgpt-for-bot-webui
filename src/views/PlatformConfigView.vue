<script setup lang="ts">
import ConfigurationList from '@/components/ConfigurationList.vue'
import { useRouter } from 'vue-router'

import TheWelcome from '@/components/TheWelcome.vue'
import SideBar, { Nav } from '@/components/Sidebar.vue'
import { useLoadingBar } from 'naive-ui';
import { ref } from 'vue';

const $router = useRouter()

const navList: Nav[] = [
  {
    key: "onebot",
    text: "OneBot",
    path: "/platforms/onebot",
  },
  {
    key: "telegram",
    text: "Telegram",
    path: "/platforms/telegram",
  },
  {
    key: "discord",
    text: "Discord",
    path: "/platforms/discord",
  },
  {
    key: "wecom",
    text: "企业微信",
    path: "/platforms/wecom",
  },
  {
    key: "http",
    text: "HTTP 接口",
    path: "/platforms/http",
  }
]

const loadingBar = useLoadingBar();
const selectPlatform = ref('onebot')

const configurationGroups = ref([])
const configurationValue = ref({})


async function getConfigurationSchema() {
  const response = await fetch('/backend-api/v1/config?key=' + selectPlatform.value + '&type=schema');
  const data = await response.json();
  configurationGroups.value = [data];
}


async function getConfigurationValue() {
  const response = await fetch('/backend-api/v1/config?key=' + selectPlatform.value + '&type=value');
  const data = await response.json();
  configurationValue.value = data;
}
function onPlatformSelect(name?: string) {
  selectPlatform.value = name!!
  resetConfig()
}

function resetConfig() {
  loadingBar.start()
  getConfigurationSchema().then(() => {
    return getConfigurationValue()
  })
    .then(() => {
      loadingBar.finish()
    })
    .catch((err) => {
      console.error(err)
      loadingBar.error()
    })
}

function saveConfig(config: object) {
  loadingBar.start()
  console.log(config)
  fetch('/backend-api/v1/config?key=' + selectPlatform.value, {
    method: 'POST',
    body: JSON.stringify(config),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
    .then(res => {
      if (res.ok) {
        loadingBar.finish()
        return res.text();
      }

      throw new Error('Something went wrong.');

    })
    .catch(err => {
      console.log('err')
      loadingBar.error()
    })
}

resetConfig()

</script>

<template>
  <div class="sub-content-wrapper">
    <div class="sidebar-wrapper">
      <SideBar :nav-list="navList" @onSelect="onPlatformSelect" :icon-only="false" title="平台设置"/>
    </div>
    <div class="sub-main-content-wrapper">
      <ConfigurationList :title="selectPlatform" :configuration-groups="configurationGroups"
        :configurationValue="configurationValue" @save="saveConfig" @reset="resetConfig"></ConfigurationList>
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
}

.sub-main-content-wrapper {
  flex-grow: 1;
  /* padding: 16px; */
}
</style>
