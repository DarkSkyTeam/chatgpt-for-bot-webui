<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { NSpace, NText, NBadge, NTooltip } from 'naive-ui'
import { useAppStore } from '@/stores/app'
import { useUpdateViewModel } from '@/views/system/update.vm'
import UpdateChecker from '@/components/UpdateChecker.vue'
const updateCheckerRef = ref<InstanceType<typeof UpdateChecker> | null>(null)
const appStore = useAppStore()
// 连接状态
const connecting = ref(false)

// 从环境变量获取版本号
const webUIVersion = import.meta.env.VITE_APP_VERSION || 'unknown'

const fetchStatus = () => {
  fetch('/backend-api/api/system/status')
      .then(response => response.json())
      .then(data => {
        connecting.value = false
        appStore.updateSystemStatus({
          status: 'normal',
          apiConnected: true,
          memoryUsage: data.status.memory_usage.rss,
          cpuUsage: data.status.cpu_usage,
          uptime: data.status.uptime,
          activeAdapters: data.status.active_adapters,
          activeBackends: data.status.active_backends,
          loadedPlugins: data.status.loaded_plugins,
          workflowCount: data.status.workflow_count,
          version: data.status.version
        })
      })
      .catch(error => {
        console.error('获取系统状态失败:', error)
        connecting.value = false
        appStore.updateSystemStatus({
          status: 'error',
          apiConnected: false
    })
  })
}
// 模拟状态更新
let timer: number


onMounted(() => {
  updateCheckerRef.value?.checkUpdate()
  appStore.updateSystemStatus({
    status: 'warning',
    apiConnected: false,
    memoryUsage: 0,
    cpuUsage: 0,
    uptime: 0,
    activeAdapters: 0,
    activeBackends: 0,
    loadedPlugins: 0,
    workflowCount: 0,
    version: 'unknown'
  })
  connecting.value = true
  timer = setInterval(() => {
    fetchStatus()
  }, 10000)
  fetchStatus()
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="status-bar-content">
    <!-- 更新检查组件 -->
    <update-checker ref="updateCheckerRef" />

    <n-space align="center" :size="20">
      <n-space align="center" :size="4">
        <n-badge dot :type="connecting
            ? 'warning'
            : appStore.systemStatus.status === 'normal'
              ? 'success'
              : 'error'
          " />
        <n-text>
          系统状态:
          <span v-if="connecting">连接中...</span>
          <span v-else>
            {{ appStore.systemStatus.status === 'normal' ? '正常' : '异常' }}
          </span>
        </n-text>
      </n-space>

      <n-space align="center" :size="4">
        <n-badge dot :type="appStore.systemStatus.apiConnected ? 'success' : 'error'" />
        <n-text>API: {{ appStore.systemStatus.apiConnected ? '已连接' : '未连接' }}</n-text>
      </n-space>

      <n-space align="center">
        <n-text>WebUI 版本: {{ webUIVersion }}</n-text>
        <n-text v-if="appStore.systemStatus.status === 'normal'">后端版本: {{ appStore.systemStatus.version }}</n-text>
      </n-space>

      <n-space v-if="appStore.systemStatus.status === 'normal'">
        <n-text>内存使用: {{ (appStore.systemStatus.memoryUsage / 1024).toFixed(2) }} MB</n-text>
        <n-text>CPU: {{ appStore.systemStatus.cpuUsage }}%</n-text>
        <n-text>IM: {{ appStore.systemStatus.activeAdapters }}</n-text>
        <n-text>LLM: {{ appStore.systemStatus.activeBackends }}</n-text>
        <n-text>插件: {{ appStore.systemStatus.loadedPlugins }}</n-text>
        <n-text>工作流: {{ appStore.systemStatus.workflowCount }}</n-text>
      </n-space>
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