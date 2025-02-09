import { http } from '@/utils/http'

export interface DispatchRule {
  rule_id: string
  name: string
  description: string
  type: string
  priority: number
  workflow_id: string
  enabled: boolean
  config: Record<string, any>  // 规则类型特定的配置
  metadata: Record<string, any>  // 其他元数据
  is_active: boolean
}

export interface DispatchRuleConfigSchema {
  configSchema: Record<string, any>
  error?: string
}

export const dispatchApi = {
  // 获取所有可用的规则类型
  getRuleTypes: () => {
    return http.get<{ types: string[] }>('/dispatch/types')
  },

  // 获取所有规则
  getRules: () => {
    return http.get<{ rules: DispatchRule[] }>('/dispatch/rules')
  },

  // 获取规则配置模式
  getRuleConfigSchema: (type: string) => {
    return http.get<DispatchRuleConfigSchema>(`/dispatch/types/${type}/config-schema`)
  },

  // 创建规则
  createRule: (rule: Partial<DispatchRule>) => {
    return http.post<{ rule: DispatchRule }>('/dispatch/rules', rule)
  },

  // 更新规则
  updateRule: (ruleId: string, rule: Partial<DispatchRule>) => {
    return http.put<{ rule: DispatchRule }>(`/dispatch/rules/${ruleId}`, rule)
  },

  // 删除规则
  deleteRule: (ruleId: string) => {
    return http.delete(`/dispatch/rules/${ruleId}`)
  },

  // 启用规则
  enableRule: (ruleId: string) => {
    return http.post(`/dispatch/rules/${ruleId}/enable`)
  },

  // 禁用规则
  disableRule: (ruleId: string) => {
    return http.post(`/dispatch/rules/${ruleId}/disable`)
  }
} 