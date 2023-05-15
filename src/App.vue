<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { NLoadingBarProvider, NDialogProvider, NLoading, NMessageProvider } from 'naive-ui'
import HelloWorld from './components/HelloWorld.vue'
import AppLayout from './layouts/AppLayout.vue'
</script>

<template>
  <n-message-provider>
    <n-loading-bar-provider>
      <n-dialog-provider>
        <RouterView />
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-message-provider>
</template>

<style scoped>

</style>
