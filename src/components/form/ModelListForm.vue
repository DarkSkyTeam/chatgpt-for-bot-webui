<script setup lang="ts">
import { h } from 'vue'
import { NInput, NButton, NIcon } from 'naive-ui'
import { CloseOutline, AddOutline } from '@vicons/ionicons5'

const props = defineProps<{
  value: string[]
}>()

const emit = defineEmits<{
  'update:value': [value: string[]]
}>()

const updateValue = (newValue: string[]) => {
  emit('update:value', newValue)
}

const renderArrayItem = (index: number) => {
  const value = props.value
  const removeItem = () => {
    const newValue = [...value]
    newValue.splice(index, 1)
    updateValue(newValue)
  }

  const updateItemValue = (val: string) => {
    const newValue = [...value]
    newValue[index] = val
    updateValue(newValue)
  }

  return h('div', { 
    style: { 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '8px',
      gap: '8px'
    } 
  }, [
    h('span', { 
      style: { 
        minWidth: '32px',
        color: 'var(--n-text-color-3)'
      } 
    }, `[${index + 1}]`),
    h('div', { style: { flex: 1 } }, [
      h(NInput, {
        value: value[index],
        type: 'text',
        placeholder: '输入模型名称',
        onUpdateValue: updateItemValue
      })
    ]),
    h(NButton, { 
      type: 'error', 
      size: 'tiny',
      quaternary: true,
      onClick: removeItem,
      disabled: value.length === 1
    }, {
      default: () => h(NIcon, null, { default: () => h(CloseOutline) })
    })
  ])
}

const addItem = () => {
  const newValue = [...props.value, '']
  updateValue(newValue)
}
</script>

<template>
  <div class="model-list" style="padding: 5px 0">
    <template v-if="value.length > 0">
      <component :is="renderArrayItem(index)" v-for="(_, index) in value" :key="index" />
    </template>
    <div v-else style="color: var(--n-text-color-3);">
      暂无数据
    </div>
    <n-button 
      type="primary"
      size="small"
      dashed
      style="width: 100%; margin-top: 8px"
      @click="addItem"
    >
      <template #icon>
        <n-icon><add-outline /></n-icon>
      </template>
      添加
    </n-button>
  </div>
</template>

<style scoped>
.model-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style> 