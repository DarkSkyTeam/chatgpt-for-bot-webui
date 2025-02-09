<script setup lang="ts">
import { NCard, NSpace, NButton, NPopover, NForm, NFormItem, NInput } from 'naive-ui'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: {
    block_id: string
    type_name: string
    name: string
    config: Record<string, any>
  }
}>()

// 根据节点类型定义输入输出端口
const getPortsConfig = (type: string) => {
  switch (type) {
    case 'MessageInputBlock':
      return {
        outputs: [{ id: 'message', label: '消息' }],
        inputs: []
      }
    case 'MessageOutputBlock':
      return {
        outputs: [],
        inputs: [{ id: 'message', label: '消息' }]
      }
    case 'LLMBlock':
      return {
        inputs: [{ id: 'prompt', label: '提示词' }],
        outputs: [{ id: 'response', label: '回复' }]
      }
    case 'PromptBlock':
      return {
        inputs: [{ id: 'input', label: '输入' }],
        outputs: [{ id: 'output', label: '输出' }]
      }
    default:
      return {
        inputs: [],
        outputs: []
      }
  }
}

const { inputs, outputs } = getPortsConfig(props.data.type_name)
</script>

<template>
  <div class="workflow-node">
    <n-card size="small" :title="data.name">
      <template #header-extra>
        <n-popover trigger="click">
          <template #trigger>
            <n-button quaternary circle size="small">
              <div class="i-carbon-settings" />
            </n-button>
          </template>
          <n-form label-placement="left" label-width="80">
            <n-form-item v-for="(value, key) in data.config" :key="key" :label="key">
              <n-input v-model:value="data.config[key]" />
            </n-form-item>
          </n-form>
        </n-popover>
      </template>
      
      <div class="node-type">{{ data.type_name }}</div>
      
      <!-- 输入端口 -->
      <template v-for="input in inputs" :key="input.id">
        <div class="port port-input">
          <Handle
            :id="input.id"
            type="target"
            :position="Position.Left"
          />
          <span class="port-label">{{ input.label }}</span>
        </div>
      </template>
      
      <!-- 输出端口 -->
      <template v-for="output in outputs" :key="output.id">
        <div class="port port-output">
          <span class="port-label">{{ output.label }}</span>
          <Handle
            :id="output.id"
            type="source"
            :position="Position.Right"
          />
        </div>
      </template>
    </n-card>
  </div>
</template>

<style scoped>
.workflow-node {
  min-width: 150px;
}

.node-type {
  font-size: 12px;
  color: var(--n-text-color-3);
  margin-bottom: 8px;
}

.port {
  position: relative;
  display: flex;
  align-items: center;
  margin: 4px 0;
}

.port-input {
  padding-left: 12px;
}

.port-output {
  padding-right: 12px;
  justify-content: flex-end;
}

.port-label {
  font-size: 12px;
  margin: 0 4px;
}

:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  background: var(--n-primary-color);
}

:deep(.vue-flow__handle-connecting) {
  background: var(--n-success-color);
}

:deep(.vue-flow__handle-valid) {
  background: var(--n-success-color);
}

:deep(.vue-flow__handle-invalid) {
  background: var(--n-error-color);
}
</style> 