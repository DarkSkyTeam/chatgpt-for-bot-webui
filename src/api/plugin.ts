import { http } from '@/utils/http'

export interface PluginInfo {
  name: string
  package_name: string
  description: string
  version: string
  author: string
  homepage?: string
  license?: string
  is_internal: boolean
  is_enabled: boolean
  metadata?: {
    category?: string
    tags?: string[]
  }
}

export const pluginApi = {
  /**
   * 获取已安装插件列表
   */
  getPlugins() {
    return http.get<{ plugins: PluginInfo[] }>('/plugin/plugins')
  },

  /**
   * 安装插件
   */
  installPlugin(packageName: string, version?: string) {
    return http.post<void>('/plugin/plugins', { package_name: packageName, version })
  },

  /**
   * 卸载插件
   */
  uninstallPlugin(packageName: string) {
    return http.delete<void>(`/plugin/plugins/${packageName}`)
  },

  /**
   * 启用/禁用插件
   */
  togglePlugin(packageName: string, enable: boolean) {
    return http.post<void>(`/plugin/plugins/${packageName}/${enable ? 'enable' : 'disable'}`)
  },

  /**
   * 更新插件
   */
  updatePlugin(packageName: string) {
    return http.put<void>(`/plugin/plugins/${packageName}`)
  }
} 