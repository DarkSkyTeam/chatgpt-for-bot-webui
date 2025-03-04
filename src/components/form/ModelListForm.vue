<script setup lang="ts">
import { h, ref } from 'vue'
import { NButton, NIcon, NCard, NAvatar, NEmpty } from 'naive-ui'
import { CloseOutline, PencilOutline } from '@vicons/ionicons5'

const props = defineProps<{
  value: string[]
}>()

const emit = defineEmits<{
  'update:value': [value: string[]],
  'edit': [index: number, model: string]
}>()

const updateValue = (newValue: string[]) => {
  emit('update:value', newValue)
}

const handleEdit = (index: number) => {
  emit('edit', index, props.value[index])
}

const getRandomLetter = (str: string) => {
  if (!str) return 'M'
  const letters = str.replace(/[^a-zA-Z]/g, '') // 过滤掉非字母字符
  if (!letters.length) return 'M'
  const randomIndex = Math.floor(Math.random() * letters.length)
  return letters.charAt(randomIndex).toUpperCase()
}

const renderModelCard = (model: string, index: number) => {
  const removeItem = () => {
    const newValue = [...props.value]
    newValue.splice(index, 1)
    updateValue(newValue)
  }

  return h(NCard, {
    class: 'model-card',
    bordered: true,
    size: 'small',
    hoverable: true
  }, {
    default: () => h('div', {
      class: 'model-card-content'
    }, [
      h('div', { class: 'model-card-header' }, [
        h(NAvatar, {
          round: true,
          size: 'small',
          color: getRandomColor(model),
          class: 'model-avatar'
        }, { default: () => getRandomLetter(model) || 'M' }),
        h('div', { class: 'model-card-title' }, [
          h('div', { class: 'model-name' }, model || '未命名模型'),
          h('div', { class: 'model-id' }, model || '无ID')
        ])
      ]),
      h('div', { class: 'model-card-footer' }, [
        // h('div', { class: 'model-capabilities' }, [
        //   model.capabilities?.map((cap: string) => 
        //     h(NTag, {
        //       size: 'small',
        //       type: 'info',
        //       class: 'capability-tag'
        //     }, { default: () => cap })
        //   ) || []
        // ]),
        h('div', { class: 'model-card-actions' }, [
          h(NButton, {
            quaternary: true,
            circle: true,
            size: 'small',
            class: 'edit-button',
            onClick: () => handleEdit(index)
          }, { icon: () => h(NIcon, null, { default: () => h(PencilOutline) }) }),
          h(NButton, {
            type: 'error',
            size: 'small',
            quaternary: true,
            circle: true,
            onClick: removeItem,
            disabled: props.value.length === 1,
            class: 'delete-button'
          }, {
            icon: () => h(NIcon, null, { default: () => h(CloseOutline) })
          })
        ])
      ])
    ])
  })
}

// 根据字符串生成一致的颜色
const getRandomColor = (str: string) => {
  if (!str) return '#5c6ac4'

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#5c6ac4', '#1f93ff', '#18a058', '#f0883a', '#d03050',
    '#8a2be2', '#0eb57d', '#f58220', '#8f4cd7', '#13c2c2'
  ];

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
</script>

<template>
  <div class="model-list-container">
    <div class="model-list">
      <template v-if="value && value.length > 0">
        <component :is="renderModelCard(model, index)" v-for="(model, index) in value" :key="model || index" />
      </template>
      <div v-else class="empty-list">
        <n-empty description="请在这里添加要使用的模型" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.model-list-scrollbar {
  flex: 1;
  min-height: 200px;
}

.model-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 8px 4px;
}

.model-card {
  transition: all 0.2s ease;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--n-card-color);
  border: 1px solid var(--n-border-color);
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.model-card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
}

.model-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.model-avatar {
  flex-shrink: 0;
}

.model-card-title {
  flex: 1;
  overflow: hidden;
}

.model-name {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-id {
  font-size: 12px;
  color: var(--n-text-color-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.model-capabilities {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.capability-tag {
  font-size: 11px;
}

.model-card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.model-card:hover .model-card-actions {
  opacity: 1;
}

.empty-list {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  background-color: var(--n-card-color);
  border: 1px dashed var(--n-border-color);
  border-radius: 8px;
  color: var(--n-text-color-3);
}

.edit-button {
  color: var(--n-text-color-3);
}

.delete-button:not(:disabled):hover {
  color: var(--n-error-color);
  background-color: rgba(var(--n-error-color-hover-rgb), 0.1);
}
</style>