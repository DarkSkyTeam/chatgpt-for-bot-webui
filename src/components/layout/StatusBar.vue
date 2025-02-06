<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { NSpace, NText, NBadge } from 'naive-ui'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

// 模拟状态更新
let timer: NodeJS.Timer
onMounted(() => {
  timer = setInterval(() => {
    // 这里将来会通过 WebSocket 获取实时状态
    appStore.updateSystemStatus({
      memoryUsage: Math.floor(Math.random() * 1000)
    })
  }, 5000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="status-bar-content">
    <n-space align="center" :size="20">
      <n-space align="center" :size="4">
        <n-badge dot :status="appStore.systemStatus.status === 'normal' ? 'success' : 'error'" />
        <n-text>系统状态: {{ appStore.systemStatus.status === 'normal' ? '正常' : '异常' }}</n-text>
      </n-space>

      <n-space align="center" :size="4">
        <n-badge dot :status="appStore.systemStatus.apiConnected ? 'success' : 'error'" />
        <n-text>API: {{ appStore.systemStatus.apiConnected ? '已连接' : '未连接' }}</n-text>
      </n-space>

      <n-text>内存使用: {{ appStore.systemStatus.memoryUsage }} MB</n-text>
    </n-space>
  </div>
</template>

<style scoped>
.status-bar-content {
  height: 100%;
  display: flex;
  align-items: center;
}
</style> 