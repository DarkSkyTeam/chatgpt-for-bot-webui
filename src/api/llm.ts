import { http } from '@/utils/http'

export interface LLMBackend {
  name: string
  adapter: string
  config: Record<string, any>
  enable: boolean
  models: string[]
}

export const llmApi = {
  /**
   * 获取适配器类型列表
   */
  getAdapterTypes() {
    return http.get<{ types: string[] }>('/llm/types')
  },

  /**
   * 获取后端列表
   */
  getBackends() {
    return http.get<{ backends: LLMBackend[] }>('/llm/backends')
  },

  /**
   * 创建后端
   */
  createBackend(backend: LLMBackend) {
    return http.post<void>('/llm/backends', backend)
  },

  /**
   * 更新后端
   */
  updateBackend(name: string, backend: LLMBackend) {
    return http.put<void>(`/llm/backends/${name}`, backend)
  },

  /**
   * 删除后端
   */
  deleteBackend(name: string) {
    return http.delete<void>(`/llm/backends/${name}`)
  },

  /**
   * 启用/禁用后端
   */
  toggleBackend(name: string, enable: boolean) {
    return http.post<void>(`/llm/backends/${name}/${enable ? 'enable' : 'disable'}`)
  }
} 