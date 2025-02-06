<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard, NSpace, NButton, NDataTable, NModal, NInput, NForm, NFormItem } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import WorkflowCanvas from './components/WorkflowCanvas.vue'

interface WorkflowInfo {
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

interface WorkflowDefinition extends WorkflowInfo {
  blocks: BlockInstance[]
  wires: Wire[]
}

interface BlockInstance {
  block_id: string
  type_name: string
  name: string
  config: Record<string, any>
  position: {
    x: number
    y: number
  }
}

interface Wire {
  source_block: string
  source_output: string
  target_block: string
  target_input: string
}

const workflows = ref<WorkflowInfo[]>([])
const showModal = ref(false)
const showCanvas = ref(false)
const currentWorkflow = ref<WorkflowDefinition | null>(null)

const formModel = ref({
  group_id: '',
  workflow_id: '',
  name: '',
  description: ''
})

// 获取所有工作流
const fetchWorkflows = async () => {
  try {
    const response = await fetch('/backend-api/api/workflow')
    const data = await response.json()
    workflows.value = data.workflows
  } catch (error) {
    console.error('获取工作流列表失败:', error)
  }
}

// 获取特定工作流
const fetchWorkflow = async (groupId: string, workflowId: string) => {
  try {
    const response = await fetch(`/api/workflow/${groupId}/${workflowId}`)
    const data = await response.json()
    currentWorkflow.value = data.workflow
    showCanvas.value = true
  } catch (error) {
    console.error('获取工作流详情失败:', error)
  }
}

// 创建工作流
const handleCreate = async () => {
  try {
    const response = await fetch(`/api/workflow/${formModel.value.group_id}/${formModel.value.workflow_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...formModel.value,
        blocks: [],
        wires: [],
        metadata: {
          category: 'custom',
          tags: []
        }
      })
    })
    
    if (response.ok) {
      showModal.value = false
      await fetchWorkflows()
      // 创建后直接打开编辑器
      await fetchWorkflow(formModel.value.group_id, formModel.value.workflow_id)
    }
  } catch (error) {
    console.error('创建工作流失败:', error)
  }
}

// 删除工作流
const handleDelete = async (workflow: WorkflowInfo) => {
  if (confirm(`确定要删除工作流 ${workflow.name} 吗？`)) {
    try {
      const response = await fetch(`/api/workflow/${workflow.group_id}/${workflow.workflow_id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchWorkflows()
      }
    } catch (error) {
      console.error('删除工作流失败:', error)
    }
  }
}

// 保存工作流
const handleSave = async (workflow: WorkflowDefinition) => {
  try {
    const response = await fetch(`/api/workflow/${workflow.group_id}/${workflow.workflow_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflow)
    })
    
    if (response.ok) {
      await fetchWorkflows()
    }
  } catch (error) {
    console.error('保存工作流失败:', error)
  }
}

const createColumns = (): DataTableColumns<WorkflowInfo> => {
  return [
    {
      title: '名称',
      key: 'name'
    },
    {
      title: '描述',
      key: 'description'
    },
    {
      title: '区块数量',
      key: 'block_count'
    },
    {
      title: '分类',
      key: 'metadata.category'
    },
    {
      title: '标签',
      key: 'metadata.tags',
      render(row) {
        return row.metadata?.tags?.join(', ') || ''
      }
    },
    {
      title: '操作',
      key: 'actions',
      render(row) {
        return h(
          NSpace,
          {},
          {
            default: () => [
              h(
                NButton,
                {
                  size: 'small',
                  onClick: () => fetchWorkflow(row.group_id, row.workflow_id)
                },
                { default: () => '编辑' }
              ),
              h(
                NButton,
                {
                  size: 'small',
                  type: 'error',
                  onClick: () => handleDelete(row)
                },
                { default: () => '删除' }
              )
            ]
          }
        )
      }
    }
  ]
}

onMounted(() => {
  fetchWorkflows()
})
</script>

<template>
  <div class="workflow-view">
    <n-space vertical :size="16">
      <n-card title="工作流管理">
        <template #header-extra>
          <n-button
            type="primary"
            @click="() => {
              formModel = {
                group_id: '',
                workflow_id: '',
                name: '',
                description: ''
              }
              showModal = true
            }"
          >
            创建工作流
          </n-button>
        </template>
        <n-data-table :columns="createColumns()" :data="workflows" />
      </n-card>
    </n-space>

    <!-- 创建工作流表单 -->
    <n-modal v-model:show="showModal" title="创建工作流">
      <n-form :model="formModel" label-placement="left" label-width="100">
        <n-form-item label="组ID" path="group_id">
          <n-input v-model:value="formModel.group_id" placeholder="请输入工作流组ID" />
        </n-form-item>
        <n-form-item label="工作流ID" path="workflow_id">
          <n-input v-model:value="formModel.workflow_id" placeholder="请输入工作流ID" />
        </n-form-item>
        <n-form-item label="名称" path="name">
          <n-input v-model:value="formModel.name" placeholder="请输入工作流名称" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="formModel.description" type="textarea" placeholder="请输入工作流描述" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleCreate">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 工作流画布 -->
    <n-modal v-model:show="showCanvas" style="width: 90%; max-width: 1400px">
      <workflow-canvas
        v-if="currentWorkflow"
        :workflow="currentWorkflow"
        @save="handleSave"
      />
    </n-modal>
  </div>
</template>

<style scoped>
.workflow-view {
  height: 100%;
}
</style> 