<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { NLoadingBarProvider } from 'naive-ui'
import HelloWorld from './components/HelloWorld.vue'
import AppLayout from './layouts/AppLayout.vue'
</script>

<template>
  <n-loading-bar-provider>
  <RouterView />
</n-loading-bar-provider>
</template>

<style scoped>

</style>
