import { http } from '@/utils/http'

export interface IMPlatform {
  name: string
  adapter: string
  config: Record<string, any>
  enable: boolean
  accounts: IMAccount[]
}

export interface IMAccount {
  id: string
  platform: string
  name: string
  status: 'online' | 'offline'
  config: Record<string, any>
}

export interface IMAdapter {
  name: string
  adapter: string
  is_running: boolean
  config: Record<string, any>
}

export interface ConfigSchema {
  title: string
  type: string
  properties: Record<string, {
    title: string
    type: string
    description?: string
    default?: any
    minimum?: number
    maximum?: number
    enum?: any[]
    enumNames?: string[]
  }>
  required?: string[]
}

export const imApi = {
  /**
   * 获取适配器类型列表
   */
  getAdapterTypes() {
    return http.get<{ types: string[] }>('/im/types')
  },

  /**
   * 获取适配器列表
   */
  getAdapters() {
    return http.get<{ adapters: IMAdapter[] }>('/im/adapters')
  },

  /**
   * 获取适配器详情
   */
  getAdapter(adapterId: string) {
    return http.get<{ adapter: IMAdapter }>(`/im/adapters/${adapterId}`)
  },

  /**
   * 创建适配器
   */
  createAdapter(adapter: Omit<IMAdapter, 'is_running'>) {
    return http.post<{ adapter: IMAdapter }>('/im/adapters', adapter)
  },

  /**
   * 更新适配器
   */
  updateAdapter(adapterId: string, adapter: Omit<IMAdapter, 'is_running'>) {
    return http.put<{ adapter: IMAdapter }>(`/im/adapters/${adapterId}`, adapter)
  },

  /**
   * 删除适配器
   */
  deleteAdapter(adapterId: string) {
    return http.delete<void>(`/im/adapters/${adapterId}`)
  },

  /**
   * 启动适配器
   */
  startAdapter(adapterId: string) {
    return http.post<void>(`/im/adapters/${adapterId}/start`)
  },

  /**
   * 停止适配器
   */
  stopAdapter(adapterId: string) {
    return http.post<void>(`/im/adapters/${adapterId}/stop`)
  },

  /**
   * 获取适配器配置模式
   */
  getAdapterConfigSchema(adapterType: string) {
    return http.get<{ configSchema: ConfigSchema }>(`/im/types/${adapterType}/config-schema`)
  },

  /**
   * 获取平台列表
   */
  getPlatforms() {
    return http.get<{ platforms: IMPlatform[] }>('/im/platforms')
  },

  /**
   * 创建平台
   */
  createPlatform(platform: IMPlatform) {
    return http.post<void>('/im/platforms', platform)
  },

  /**
   * 更新平台
   */
  updatePlatform(name: string, platform: IMPlatform) {
    return http.put<void>(`/im/platforms/${name}`, platform)
  },

  /**
   * 删除平台
   */
  deletePlatform(name: string) {
    return http.delete<void>(`/im/platforms/${name}`)
  },

  /**
   * 启用/禁用平台
   */
  togglePlatform(name: string, enable: boolean) {
    return http.post<void>(`/im/platforms/${name}/${enable ? 'enable' : 'disable'}`)
  },

  /**
   * 获取账号列表
   */
  getAccounts() {
    return http.get<{ accounts: IMAccount[] }>('/im/accounts')
  },

  /**
   * 删除账号
   */
  deleteAccount(id: string) {
    return http.delete<void>(`/im/accounts/${id}`)
  }
} 