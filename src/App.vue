<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { NLoadingBarProvider, NDialogProvider, NLoading, NMessageProvider, NConfigProvider, lightTheme } from 'naive-ui'
import HelloWorld from './components/HelloWorld.vue'
import AppLayout from './layouts/AppLayout.vue'

const theme = lightTheme
</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <n-loading-bar-provider>
        <n-dialog-provider>
          <RouterView />
        </n-dialog-provider>
      </n-loading-bar-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
  height: 100%;
}
</style>
