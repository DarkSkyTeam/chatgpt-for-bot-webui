<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NSpace, 
  NCard, 
  NButton, 
  NDataTable, 
  NPopconfirm, 
  useMessage, 
  NEmpty, 
  NSkeleton,
  NTag,
  NTooltip,
  NIcon
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { listWorkflows, deleteWorkflow } from '@/api/workflow'
import { CreateOutline, TrashOutline, AddOutline } from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

interface Workflow {
  group_id: string
  workflow_id: string
  name: string
  description: string
  block_count: number
  metadata?: Record<string, any>
}

const workflows = ref<Workflow[]>([])
const loading = ref(false)
const deleting = ref<string>('')

const columns: DataTableColumns<Workflow> = [
  {
    title: 'ID',
    key: 'id',
    width: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '名称',
    key: 'name',
    width: 200,
    render(row) {
      return h(NTooltip, null, {
        trigger: () => h('span', { class: 'workflow-name' }, row.name),
        default: () => row.name
      })
    }
  },
  {
    title: '描述',
    key: 'description',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '区块数量',
    key: 'block_count',
    width: 100,
    render(row) {
      return h(NTag, {
        type: 'info',
        round: true,
        size: 'small'
      }, {
        default: () => row.block_count
      })
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 160,
    render(row) {
      const id = `${row.group_id}:${row.workflow_id}`
      return h(NSpace, { align: 'center' }, [
        h(NButton, {
          quaternary: true,
          size: 'small',
          onClick: () => handleEdit(row),
          class: 'action-button'
        }, {
          icon: () => h(NIcon, null, { default: () => h(CreateOutline) }),
          default: () => '编辑'
        }),
        h(NPopconfirm, {
          onPositiveClick: () => handleDelete(row),
          class: deleting.value === id ? 'deleting' : ''
        }, {
          trigger: () => h(NButton, {
            quaternary: true,
            size: 'small',
            type: 'error',
            class: 'action-button'
          }, {
            icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
            default: () => '删除'
          }),
          default: () => '确认删除该工作流？'
        })
      ])
    }
  }
]

const fetchWorkflows = async () => {
  loading.value = true
  try {
    const { workflows: data } = await listWorkflows()
    workflows.value = data
  } catch (error) {
    message.error('获取工作流列表失败')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  router.push('/workflow/editor')
}

const handleEdit = (row: Workflow) => {
  router.push(`/workflow/editor/${row.group_id}:${row.workflow_id}`)
}

const handleDelete = async (row: Workflow) => {
  const id = `${row.group_id}:${row.workflow_id}`
  deleting.value = id
  try {
    await deleteWorkflow(row.group_id, row.workflow_id)
    message.success('删除成功')
    await fetchWorkflows()
  } catch (error) {
    message.error('删除失败')
  } finally {
    deleting.value = ''
  }
}

const displayWorkflows = computed(() => {
  return workflows.value.map(workflow => {
    return {
      ...workflow,
      id: workflow.group_id + ':' + workflow.workflow_id
    }
  })
})


onMounted(() => {
  fetchWorkflows()
})
</script>

<template>
  <div class="workflow-list">
    <NCard title="工作流管理" class="workflow-card">
      <template #header-extra>
        <NButton
          type="primary"
          @click="handleCreate"
          class="create-button"
        >
          <template #icon>
            <NIcon><AddOutline /></NIcon>
          </template>
          创建工作流
        </NButton>
      </template>

      <div v-if="loading" class="loading-skeleton">
        <NSkeleton text :repeat="3" />
      </div>
      
      <NEmpty
        v-else-if="displayWorkflows.length === 0"
        description="暂无工作流"
      >
        <template #extra>
          <NButton
            type="primary"
            @click="handleCreate"
            class="create-button"
          >
            创建工作流
          </NButton>
        </template>
      </NEmpty>

      <NDataTable
        v-else
        :columns="columns"
        :data="displayWorkflows"
        :loading="loading"
        class="workflow-table"
        :row-class-name="() => 'workflow-row'"
        :pagination="{
          pageSize: 10
        }"
      />
    </NCard>
  </div>
</template>

<style scoped>

.workflow-card {
  animation: fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.create-button {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.create-button:hover {
  transform: translateY(-1px);
}

.loading-skeleton {
  padding: 1rem 0;
}

.workflow-table :deep(.workflow-row) {
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.workflow-table :deep(.workflow-row:hover) {
  background-color: rgba(0, 122, 255, 0.05);
}

.workflow-name {
  font-weight: 500;
  color: var(--primary-color);
}

.action-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button:hover {
  transform: translateY(-1px);
  background-color: rgba(0, 122, 255, 0.1);
}

.action-button:active {
  transform: translateY(0);
}

.deleting {
  opacity: 0.5;
  pointer-events: none;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 