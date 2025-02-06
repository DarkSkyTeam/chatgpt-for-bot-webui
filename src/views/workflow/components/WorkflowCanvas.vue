<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { NCard, NSpace, NButton, NDrawer, NDrawerContent, NSelect, NInput, NForm, NFormItem } from 'naive-ui'
import { useVueFlow, VueFlow, Background, Controls, MiniMap, Panel } from '@vue-flow/core'
import { v4 as uuidv4 } from 'uuid'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import WorkflowNode from './WorkflowNode.vue'

const props = defineProps<{
  workflow: {
    group_id: string
    workflow_id: string
    name: string
    description: string
    blocks: Array<{
      block_id: string
      type_name: string
      name: string
      config: Record<string, any>
      position: {
        x: number
        y: number
      }
    }>
    wires: Array<{
      source_block: string
      source_output: string
      target_block: string
      target_input: string
    }>
  }
}>()

const emit = defineEmits<{
  (e: 'save', workflow: typeof props.workflow): void
}>()

const {
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  addNodes,
  addEdges,
  setNodes,
  setEdges
} = useVueFlow()

// 节点类型列表
const blockTypes = ref([
  { label: '消息输入', value: 'MessageInputBlock' },
  { label: '消息输出', value: 'MessageOutputBlock' },
  { label: '语言模型', value: 'LLMBlock' },
  { label: '提示词处理', value: 'PromptBlock' }
])

// 添加节点抽屉
const showAddDrawer = ref(false)
const newNodeForm = ref({
  type_name: '',
  name: '',
  config: {}
})

// 将工作流数据转换为 Vue Flow 节点和边
const convertWorkflowToFlow = () => {
  // 转换节点
  const flowNodes = props.workflow.blocks.map(block => ({
    id: block.block_id,
    type: 'workflow-node',
    position: block.position,
    data: {
      ...block
    }
  }))
  
  // 转换连线
  const flowEdges = props.workflow.wires.map(wire => ({
    id: `${wire.source_block}-${wire.target_block}`,
    source: wire.source_block,
    target: wire.target_block,
    sourceHandle: wire.source_output,
    targetHandle: wire.target_input
  }))
  
  setNodes(flowNodes)
  setEdges(flowEdges)
}

// 将 Vue Flow 数据转换回工作流格式
const convertFlowToWorkflow = () => {
  const blocks = nodes.value.map(node => ({
    block_id: node.id,
    type_name: node.data.type_name,
    name: node.data.name,
    config: node.data.config,
    position: node.position
  }))
  
  const wires = edges.value.map(edge => ({
    source_block: edge.source,
    source_output: edge.sourceHandle || '',
    target_block: edge.target,
    target_input: edge.targetHandle || ''
  }))
  
  return {
    ...props.workflow,
    blocks,
    wires
  }
}

// 添加新节点
const handleAddNode = () => {
  const nodeId = uuidv4()
  addNodes([
    {
      id: nodeId,
      type: 'workflow-node',
      position: { x: 100, y: 100 },
      data: {
        block_id: nodeId,
        ...newNodeForm.value
      }
    }
  ])
  showAddDrawer.value = false
  newNodeForm.value = {
    type_name: '',
    name: '',
    config: {}
  }
}

// 保存工作流
const handleSave = () => {
  const workflow = convertFlowToWorkflow()
  emit('save', workflow)
}

// 监听工作流数据变化
watch(
  () => props.workflow,
  () => {
    convertWorkflowToFlow()
  },
  { immediate: true }
)

// 注册自定义节点类型
const nodeTypes = {
  'workflow-node': WorkflowNode
}
</script>

<template>
  <div class="workflow-canvas">
    <n-space vertical size="large">
      <n-space justify="end">
        <n-button @click="showAddDrawer = true">添加节点</n-button>
        <n-button type="primary" @click="handleSave">保存</n-button>
      </n-space>
      
      <div class="canvas-container">
        <vue-flow
          v-model="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          @nodes-change="onNodesChange"
          @edges-change="onEdgesChange"
          @connect="onConnect"
          fit-view-on-init
        >
          <background pattern-color="#aaa" gap="8" size="1" />
          <controls />
          <mini-map />
          <panel position="top-right">
            <n-card size="small" style="width: 200px">
              <template #header>工作流信息</template>
              <n-space vertical size="small">
                <div>名称: {{ workflow.name }}</div>
                <div>描述: {{ workflow.description }}</div>
              </n-space>
            </n-card>
          </panel>
        </vue-flow>
      </div>
    </n-space>

    <!-- 添加节点抽屉 -->
    <n-drawer v-model:show="showAddDrawer" width="400">
      <n-drawer-content title="添加节点">
        <n-form :model="newNodeForm" label-placement="left" label-width="100">
          <n-form-item label="节点类型" path="type_name">
            <n-select
              v-model:value="newNodeForm.type_name"
              :options="blockTypes"
              placeholder="请选择节点类型"
            />
          </n-form-item>
          <n-form-item label="节点名称" path="name">
            <n-input v-model:value="newNodeForm.name" placeholder="请输入节点名称" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showAddDrawer = false">取消</n-button>
            <n-button type="primary" @click="handleAddNode">确定</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
.workflow-canvas {
  height: 100%;
}

.canvas-container {
  width: 100%;
  height: 600px;
  border: 1px solid var(--n-border-color);
  border-radius: 3px;
}
</style> 