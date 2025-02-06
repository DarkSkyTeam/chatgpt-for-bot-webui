import { http } from '@/utils/http'

export interface WorkflowInfo {
  group_id: string
  workflow_id: string
  name: string
  description: string
  block_count: number
  metadata?: {
    category?: string
    tags?: string[]
  }
}

export interface BlockInstance {
  block_id: string
  type_name: string
  name: string
  config: Record<string, any>
  position: {
    x: number
    y: number
  }
}

export interface Wire {
  source_block: string
  source_output: string
  target_block: string
  target_input: string
}

export interface WorkflowDefinition extends WorkflowInfo {
  blocks: BlockInstance[]
  wires: Wire[]
}

export const workflowApi = {
  /**
   * 获取工作流列表
   */
  getWorkflows() {
    return http.get<{ workflows: WorkflowInfo[] }>('/workflow')
  },

  /**
   * 获取工作流详情
   */
  getWorkflow(groupId: string, workflowId: string) {
    return http.get<{ workflow: WorkflowDefinition }>(`/workflow/${groupId}/${workflowId}`)
  },

  /**
   * 创建工作流
   */
  createWorkflow(workflow: WorkflowDefinition) {
    return http.post<void>(`/workflow/${workflow.group_id}/${workflow.workflow_id}`, workflow)
  },

  /**
   * 更新工作流
   */
  updateWorkflow(workflow: WorkflowDefinition) {
    return http.put<void>(`/workflow/${workflow.group_id}/${workflow.workflow_id}`, workflow)
  },

  /**
   * 删除工作流
   */
  deleteWorkflow(groupId: string, workflowId: string) {
    return http.delete<void>(`/workflow/${groupId}/${workflowId}`)
  }
} 