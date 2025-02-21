<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NSpace,
  NSteps,
  NStep,
  NGrid,
  NGi,
  NStatistic,
  NButton,
  useMessage
} from 'naive-ui'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

// 计算每个步骤的完成状态
const stepsStatus = computed(() => [
  {
    completed: appStore.systemStatus.loadedPlugins > 0,
    title: '浏览插件市场',
    description: '发现并安装适合您需求的插件',
    path: '/plugins/market'
  },
  {
    completed: appStore.systemStatus.activeAdapters > 0,
    title: '添加 IM',
    description: '连接您常用的聊天平台',
    path: '/im'
  },
  {
    completed: appStore.systemStatus.activeBackends > 0,
    title: '添加 LLM',
    description: '连接 AI 模型服务',
    path: '/llm'
  },
  {
    completed: appStore.systemStatus.activeAdapters > 0 &&
      appStore.systemStatus.activeBackends > 0 &&
      appStore.systemStatus.loadedPlugins > 0,
    title: '了解调度规则',
    description: '学习如何召唤和使用 Bot',
    path: '/workflow/dispatch-rules'
  },
  {
    completed: appStore.systemStatus.activeAdapters > 0 &&
      appStore.systemStatus.activeBackends > 0 &&
      appStore.systemStatus.loadedPlugins > 0,
    title: '自定义工作流',
    description: '打造专属于您的 AI 助手',
    path: '/workflow'
  }
])

// 计算当前应该进行的步骤
const currentStep = computed(() => {
  return stepsStatus.value.findIndex(step => !step.completed)
})

const handleStepClick = (step: number, path: string) => {
  router.push(path)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return '#18a058'
    case 'warning':
      return '#f0a020'
    case 'error':
      return '#d03050'
    default:
      return '#d03050'
  }
}
</script>

<template>
  <div class="guide-container">
    <n-space vertical size="large">
        <!-- 引导步骤 -->
        <n-card title="快速开始" :bordered="false" class="steps-card" v-if="appStore.systemStatus.status === 'normal'">
        <n-steps :current="currentStep" class="guide-steps">
          <n-step v-for="(step, index) in stepsStatus" :key="index" :title="step.title" :description="step.description"
            :status="step.completed ? 'finish' : index === currentStep ? 'process' : 'wait'">
            <template #default>
              {{ step.description }}
              <n-button text type="primary" @click="handleStepClick(index, step.path)"
                :disabled="index !== currentStep && !step.completed" v-if="index === currentStep">
                立刻前往
              </n-button>
            </template>
          </n-step>
        </n-steps>
      </n-card>
      <!-- 系统状态卡片 -->
      <n-card title="系统概览" :bordered="false" class="status-card">
        <n-grid :cols="5" :x-gap="12">
          <n-gi>
            <n-statistic label="已连接 IM" :value="appStore.systemStatus.activeAdapters" />
          </n-gi>
          <n-gi>
            <n-statistic label="已连接 LLM" :value="appStore.systemStatus.activeBackends" />
          </n-gi>
          <n-gi>
            <n-statistic label="已安装插件" :value="appStore.systemStatus.loadedPlugins" />
          </n-gi>
          <n-gi>
            <n-statistic label="工作流数量" :value="appStore.systemStatus.workflowCount" />
          </n-gi>
          <n-gi>
            <n-statistic label="系统状态" :value="appStore.systemStatus.status === 'normal' ? '正常' : '异常'"
              :value-style="{ color: getStatusColor(appStore.systemStatus.status) }" />
          </n-gi>
        </n-grid>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.guide-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.status-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}

.steps-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
}

.guide-steps {
  margin: 20px 0;
}

:deep(.n-step) {
  padding: 20px 0;
}

:deep(.n-step.n-step--finish) {
  .n-step-indicator {
    background-color: #18a058;
    border-color: #18a058;
  }
}

:deep(.n-step.n-step--process) {
  .n-step-indicator {
    background-color: #2080f0;
    border-color: #2080f0;
  }
}

:deep(.n-step.n-step--wait) {
  opacity: 0.6;
}
</style>