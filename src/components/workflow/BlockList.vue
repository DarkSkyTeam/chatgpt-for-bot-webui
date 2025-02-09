<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NCollapse, NCollapseItem, NScrollbar } from 'naive-ui'
import type { BlockType } from '@/api/block'

const props = defineProps<{
  types: BlockType[]
}>()

// 按类别分组区块
const groupedTypes = computed(() => {
  const groups: Record<string, BlockType[]> = {}
  props.types.forEach(type => {
    const [category] = type.type_name.split(':')
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(type)
  })
  return groups
})

const handleDragStart = (event: DragEvent, type: BlockType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('block-type', JSON.stringify(type))
    event.dataTransfer.effectAllowed = 'copy'
  }
}
</script>

<template>
  <NCard title="区块列表" class="h-full">
    <NScrollbar class="h-[calc(100vh-200px)]">
      <NCollapse>
        <NCollapseItem
          v-for="(blocks, category) in groupedTypes"
          :key="category"
          :title="category"
        >
          <div class="space-y-2">
            <div
              v-for="type in blocks"
              :key="type.type_name"
              class="p-2 border rounded cursor-move hover:bg-gray-100 dark:hover:bg-gray-800"
              draggable="true"
              @dragstart="handleDragStart($event, type)"
            >
              <div class="font-medium">{{ type.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ type.description }}
              </div>
            </div>
          </div>
        </NCollapseItem>
      </NCollapse>
    </NScrollbar>
  </NCard>
</template> 