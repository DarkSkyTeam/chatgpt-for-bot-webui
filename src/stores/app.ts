import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const siderCollapsed = ref(localStorage.getItem('siderCollapsed') === 'true' || false)
  const secondarySiderCollapsed = ref(localStorage.getItem('secondarySiderCollapsed') === 'true' || false)
  const currentModule = ref('')
  const currentSubModule = ref('')
  const systemStatus = ref({
    status: 'normal',
    apiConnected: true,
    memoryUsage: 0,
    cpuUsage: 0,
    uptime: 0,
    activeAdapters: 0,
    activeBackends: 0,
    loadedPlugins: 0,
    workflowCount: 0,
    version: 'unknown'
  })


  // 计算属性
  const isSystemHealthy = computed(() => 
    systemStatus.value.status === 'normal' && 
    systemStatus.value.apiConnected
  )

  // 动作
  const toggleSider = () => {
    siderCollapsed.value = !siderCollapsed.value
    localStorage.setItem('siderCollapsed', siderCollapsed.value.toString())
  }

  const toggleSecondarySider = () => {
    secondarySiderCollapsed.value = !secondarySiderCollapsed.value
    localStorage.setItem('secondarySiderCollapsed', secondarySiderCollapsed.value.toString())
  }

  const setCurrentModule = (module: string) => {
    currentModule.value = module
  }

  const setCurrentSubModule = (subModule: string) => {
    currentSubModule.value = subModule
  }

  const updateSystemStatus = (status: {
    status?: string
    apiConnected?: boolean
    memoryUsage?: number
    cpuUsage?: number
    uptime?: number
    activeAdapters?: number
    activeBackends?: number
    loadedPlugins?: number
    workflowCount?: number
    version?: string
  }) => {
    systemStatus.value = {
      ...systemStatus.value,
      ...status
    }
  }


  return {
    // 状态
    siderCollapsed,
    secondarySiderCollapsed,
    currentModule,
    currentSubModule,
    systemStatus,
    // 计算属性
    isSystemHealthy,
    // 动作
    toggleSider,
    toggleSecondarySider,
    setCurrentModule,
    setCurrentSubModule,
    updateSystemStatus
  }
}) 