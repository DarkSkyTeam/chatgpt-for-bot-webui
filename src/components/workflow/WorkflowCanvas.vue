<script setup lang="ts">
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue'
import {
  NScrollbar,
  NButton,
  NModal,
  NForm,
  NFormItem,
  NInput,
  useMessage,
  NSpin,
  NSpace,
  NIcon,
  useLoadingBar,
  NTooltip
} from 'naive-ui'
import {
  SaveOutline,
  RefreshOutline,
  DownloadOutline,
  ArrowBackOutline,
  SettingsOutline
} from '@vicons/ionicons5'
import { getTypeCompatibility, type BlockType } from '@/api/block'
import type { BlockInstance, Wire } from '@/api/workflow'
import { LGraph, LGraphCanvas, LGraphNode, LiteGraph, type IWidget } from '@comfyorg/litegraph'
import { workflowEditorModel } from '@/store/workflow-editor'
import type { IBaseWidget } from 'node_modules/@comfyorg/litegraph/dist/types/widgets'
import type { Dictionary, INodeOutputSlot, ISlotType } from 'node_modules/@comfyorg/litegraph/dist/interfaces'
import { getTypeColor } from '@/utils/node-colors'

interface IBaseBlockWidget extends IBaseWidget {
  actual_name: string
}

const props = defineProps<{
  blocks: BlockInstance[]
  wires: Wire[]
  blockTypes: BlockType[]
  initialName?: string
  initialDescription?: string
  initialWorkflowId?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:blocks': [blocks: BlockInstance[]]
  'update:wires': [wires: Wire[]]
  'save': [name: string, description: string, workflowId: string]
}>()
const typeCompatibility = ref<Record<string, Record<string, boolean>>>({})

const container = ref<HTMLCanvasElement>()
let graph: LGraph = new LGraph()
let canvas: LGraphCanvas | null = null

// 获取 Intent 和 ViewState
const intent = workflowEditorModel.getIntent()
const viewState = workflowEditorModel.getViewState()

// 添加属性设置对话框相关的状态
const showSettingsModal = ref(false)
const message = useMessage()
const loadingBar = useLoadingBar()

const formRef = ref()
const formValue = ref({
  workflowId: '',
  name: '',
  description: ''
})

viewState.value.workflowId = 'user:' + Array.from({ length: 5 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
viewState.value.name = formValue.value.name
viewState.value.description = formValue.value.description

const formRules = {
  workflowId: {
    required: true,

    trigger: ['blur', 'input'],
    validator: (rule: any, value: string) => {
      if (!value) {
        return new Error('工作流ID不能为空')
      }
      if (!/^[^:]+:[^:]+$/.test(value)) {
        return new Error('工作流ID必须是 group_id:workflow_id 的格式')
      }
      return true
    }
  },
  name: {
    required: true,
    trigger: ['blur', 'input'],
    message: '工作流名称不能为空'
  }
}

// 添加工具栏按钮状态
const saving = ref(false)
const importing = ref(false)
const resetting = ref(false)

// 自定义类型定义
interface Point {
  x: number
  y: number
}

// 初始化 LiteGraph
const initGraph = () => {
  if (!container.value) {
    console.warn('[initGraph] Canvas container is not available.')
    return
  }

  const canvasElement = container.value as HTMLCanvasElement

  // 创建 LGraph 实例
  graph = new LGraph()

  // 创建 LGraphCanvas 实例并关联到 canvas 元素
  canvas = new LGraphCanvas(canvasElement, graph)

  // 配置画布
  canvas.allow_dragcanvas = true
  canvas.allow_dragnodes = true
  canvas.allow_interaction = true
  canvas.connections_width = 2
  canvas.align_to_grid = true
  canvas.highquality_render = true
  canvas.render_connection_arrows = true

  // 设置节点默认样式
  LiteGraph.NODE_TEXT_SIZE = 14
  LiteGraph.NODE_SUBTEXT_SIZE = 12
  LiteGraph.NODE_COLLAPSED_RADIUS = 8
  LiteGraph.DEFAULT_GROUP_FONT = 14
  LiteGraph.NODE_TITLE_HEIGHT = 38
  LiteGraph.NODE_SLOT_HEIGHT = 24
  LiteGraph.NODE_WIDTH = 220
  LiteGraph.NODE_MIN_WIDTH = 150
  LiteGraph.NODE_COLLAPSED_WIDTH = 100
  LiteGraph.CANVAS_GRID_SIZE = 20
  LiteGraph.auto_sort_node_types = true
  LiteGraph.use_uuids = true
  LiteGraph.isValidConnection = (a: ISlotType, b: ISlotType) => {
    console.log('[isValidConnection] Checking connection between', a, 'and', b)
    if (a == b) {
      return true
    }
    if (typeCompatibility.value[a as string] && typeCompatibility.value[a as string][b as string]) {
      return true
    }
    return false
  }

  // 设置快捷键
  setupShortcuts()

  // 更新画布尺寸以适应容器
  updateCanvasSize()

  // 设置事件监听器
  setupEventListeners()

  // 监听窗口大小变化
  window.addEventListener('resize', updateCanvasSize)

  // 设置菜单
  setupMenu()

  console.log('[initGraph] LiteGraph initialized.')
}

// 更新画布尺寸
const updateCanvasSize = () => {
  if (!container.value || !canvas) {
    console.warn('[updateCanvasSize] Canvas or container is not available.')
    return
  }

  const canvasElement = container.value as HTMLCanvasElement
  const ratio = window.devicePixelRatio
  const rect = canvasElement.parentElement!!.getBoundingClientRect()
  const { width, height } = rect


  canvasElement.width = width * ratio
  canvasElement.height = height * ratio
  canvasElement.style.width = width + 'px'
  canvasElement.style.height = height + 'px'

  canvas.resize(canvasElement.width, canvasElement.height)
  canvasElement.getContext('2d')?.scale(ratio, ratio)
}

// 更新连线颜色
const updateLinkColors = () => {
  if (!canvas) return
  const linkTypeColors = props
    .blockTypes
    .flatMap(blockType => [...blockType.inputs.map(input => input.type), ...blockType.outputs.map(output => output.type)])
    .reduce((acc, type) => {
      acc[type] = getTypeColor(type).color_on
      return acc
    }, {} as Record<string, string>)
  canvas.default_connection_color_byType = linkTypeColors
  LGraphCanvas.link_type_colors = linkTypeColors
  console.log('[updateLinkColors] Link colors updated.')
}

// 注册自定义节点类型
const registerNodeTypes = () => {
  if (!props.blockTypes || props.blockTypes.length === 0) {
    console.warn('[registerNodeTypes] No block types to register.')
    return
  }

  props.blockTypes.forEach(blockType => {
    class CustomBlock extends LiteGraph.LGraphNode {
      constructor() {
        super(blockType.label)
        blockType.inputs.forEach(input => {
          const colors = getTypeColor(input.type, input.required)
          this.addInput(input.name, input.type, { label: input.label, color_off: colors.color_off, color_on: colors.color_on })
        })

        blockType.outputs.forEach(output => {
          const colors = getTypeColor(output.type)
          this.addOutput(output.name, output.type, { label: output.label, color_off: colors.color_off, color_on: colors.color_on })
        })

        const onValueChange = () => {
          if (!this.properties.config) {
            this.properties.config = {}
          }
          this.widgets?.forEach((widget: IBaseWidget) => {
            if (widget.name && (widget as IBaseBlockWidget).actual_name) {
              // 更新节点的配置
              (this.properties.config as Dictionary<any>)[(widget as IBaseBlockWidget).actual_name] = widget.value
              // 触发更新
              updateBlocks()
            }
          })
        }

        blockType.configs.forEach(config => {
          let widget: IBaseBlockWidget | undefined = undefined
          if (config.type === 'int') {
            widget = this.addWidget('number', config.label, config.default || 0, onValueChange) as IBaseBlockWidget
          } else if (config.type === 'str') {
            widget = this.addWidget('text', config.label, config.default || '', onValueChange, { multiline: true }) as IBaseBlockWidget
          } else if (config.type === 'bool') {
            widget = this.addWidget('toggle', config.label, config.default || false, onValueChange) as IBaseBlockWidget
          } else {
            console.warn(`[registerNodeTypes] Unsupported config type: ${config.type}`)
          }
          if (widget) {
            widget.actual_name = config.name
          }
        })
        onValueChange()
        this.size = this.computeSize()
      }
      onEvent(event: string, data: any) {
        console.log(event, data)
      }
    }
    Object.defineProperty(CustomBlock, 'name', { value: blockType.label })
    LiteGraph.registerNodeType(blockType.type_name.replace(':', '/'), CustomBlock)
    console.log(`[registerNodeTypes] Registered node type: ${blockType.type_name}`)


  })
  console.log('[registerNodeTypes] Node types registered.')
}

// 设置菜单
const setupMenu = () => {
  if (!canvas) return

  canvas.getExtraMenuOptions = () => {
    return [
      {
        content: '保存工作流',
        callback: () => handleSave()
      },
      {
        content: '重置工作流',
        callback: () => handleReset()
      },
      {
        content: '导入工作流',
        callback: () => handleImport()
      },
      {
        content: '编辑工作流信息',
        callback: () => handleEditInfo()
      }
    ]
  }
}

// 设置快捷键
const setupShortcuts = () => {
  if (!canvas) return

  const canvasElement = container.value as HTMLCanvasElement

  // 确保 canvas 元素可以获得焦点
  canvasElement.tabIndex = 0
  canvasElement.focus()

  // 使用全局的 keydown 事件监听器
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (document.activeElement === container.value) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault() // 阻止默认行为
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleSave()
      }
    }
  })
}

// 设置事件监听器
const setupEventListeners = () => {
  if (!graph) {
    console.warn('[setupEventListeners] Graph is not initialized.')
    return
  }

  // 节点被添加
  graph.onNodeAdded = (node: LGraphNode) => {
    updateBlocks()
    intent.saveToHistory()
  }

  // 节点被移除
  graph.onNodeRemoved = (node: any) => {
    updateBlocks()
    intent.saveToHistory()
  }
}

// 更新区块数据
const updateBlocks = () => {
  if (!graph) {
    console.warn('[updateBlocks] Graph is not initialized.')
    return
  }

  const blocks: BlockInstance[] = Array.from(graph._nodes.values()).map(node => ({
    type_name: node.type!!.replace('/', ':'),
    name: node.id.toString(),
    config: node.properties.config || {},
    position: {
      x: Math.round(node.pos[0]),
      y: Math.round(node.pos[1])
    }
  }))

  intent.updateBlocks(blocks)
  emit('update:blocks', blocks)
}

// 更新连线数据
const updateWires = () => {
  if (!graph) {
    console.warn('[updateWires] Graph is not initialized.')
    return
  }

  const wires = Array.from(graph._links.values())
    .map(conn => {
      try {
        const sourceNode = graph.getNodeById(conn.origin_id)
        const targetNode = graph.getNodeById(conn.target_id)
        if (!sourceNode?.id || !targetNode?.id) return null
        return {
          source_block: sourceNode.id.toString(),
          source_output: sourceNode?.outputs[conn.origin_slot].name,
          target_block: targetNode.id.toString(),
          target_input: targetNode?.inputs[conn.target_slot].name


        }
      } catch (error) {
        console.warn('[updateWires] Error getting node:', error)
        return null
      }
    })
    .filter((wire): wire is Wire => wire !== null)
  intent.updateWires(wires)
  emit('update:wires', wires)
}

// 修改保存处理函数
const handleSave = async () => {
  try {
    updateBlocks()
    const errors = await formRef.value?.validate()
    if (errors?.length > 0 || !formValue.value.name || !formValue.value.workflowId) {
      message.error('工作流信息需要修改')
      showSettingsModal.value = true
      return
    }
    saving.value = true
    loadingBar.start()
    showSettingsModal.value = false
    updateWires()
    emit('save', formValue.value.name, formValue.value.description, formValue.value.workflowId)
  } catch (error: any) {
    message.error(error?.message || '保存失败')
  } finally {
    saving.value = false
    loadingBar.finish()
  }
}

// 修改重置处理函数
const handleReset = () => {
  resetting.value = true
  loadingBar.start()
  // 刷新页面
  window.location.reload()
}

// 创建节点
const createNode = (block: BlockInstance) => {
  if (!graph) return null
  const node = LiteGraph.createNode(block.type_name.replace(':', '/'))
  if (!node) {
    console.warn(`[createNode] Could not create node of type ${block.type_name}`)
    return null
  }
  node.id = block.name
  node.pos = [block.position.x, block.position.y]
  graph.add(node)

  // 恢复节点的配置
  if (block.config) {
    node.properties.config = block.config
    // 更新节点的属性
    for (const key in block.config) {
      node.properties[key] = block.config[key]
    }
    node.widgets?.forEach((widget: IBaseWidget) => {
      if (widget.name && (widget as IBaseBlockWidget).actual_name) {
        widget.value = block.config[(widget as IBaseBlockWidget).actual_name] || widget.value
      }
    })
  }
  return node
}

// 连接连线
const connectWire = (wire: Wire) => {
  if (!graph) return
  const sourceNode = graph.getNodeById(wire.source_block)
  const targetNode = graph.getNodeById(wire.target_block)
  if (sourceNode && targetNode) {
    sourceNode.connect(wire.source_output, targetNode, wire.target_input)
  }
}

// 恢复图形
const restoreGraph = () => {
  if (!graph) return
  graph.clear()
  viewState.value.blocks.forEach(block => {
    createNode(block)
  })
  viewState.value.wires.forEach(wire => {
    connectWire(wire)
  })
}

// 处理撤销
const handleUndo = () => {
  if (!viewState.value.canUndo || !graph) return
  intent.undo()
  workflowEditorModel.performActionWithoutHistory(() => {
    restoreGraph()
  })
}

// 处理重做
const handleRedo = () => {
  if (!viewState.value.canRedo || !graph) return
  intent.redo()
  workflowEditorModel.performActionWithoutHistory(() => {
    restoreGraph()
  })
}

// 修改导入处理函数
const handleImport = async () => {
  try {
    importing.value = true
    loadingBar.start()
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && graph) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            if (data.blocks && data.wires && graph) {
              intent.saveToHistory()
              workflowEditorModel.performActionWithoutHistory(() => {
                graph.clear()
                data.blocks.forEach((block: BlockInstance) => {
                  createNode(block)
                })
                data.wires.forEach((wire: Wire) => {
                  connectWire(wire)
                })
              })
              updateBlocks()
              updateWires()
              message.success('导入成功')
            }
          } catch (error) {
            message.error('导入失败：文件格式错误')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  } finally {
    importing.value = false
    loadingBar.finish()
  }
}

// 处理返回
const handleBack = () => {
  if (window.confirm('确定要离开此页面吗？您未保存的更改可能会丢失！')) {
    window.history.back()
  }
}

// 处理编辑信息
const handleEditInfo = () => {
  formValue.value = {
    workflowId: viewState.value.workflowId || '',
    name: viewState.value.name || '',
    description: viewState.value.description || ''
  }
  showSettingsModal.value = true
}

let isNodeTypesRegistered = false
let isGraphInitialized = false

// 初始化图形数据 (在合适的时机只执行一次)
const initGraphData = async () => {
  if (!graph) {
    console.warn('[initGraphData] Graph is not initialized.')
    return
  }

  // 加载区块类型和类型兼容性映射
  const compatibility = await getTypeCompatibility()
  typeCompatibility.value = compatibility
  console.log('[initGraphData] Type compatibility:', typeCompatibility.value)
  // 注册节点类型
  if (props.blockTypes.length > 0 && !isNodeTypesRegistered) {
    graph.clear()
    registerNodeTypes()
    updateLinkColors()
    isNodeTypesRegistered = true
    console.log('[initGraphData] Node types registered.')
  }

  // 如果节点类型未注册，则不执行
  if (!isNodeTypesRegistered) {
    return
  }

  // 恢复数据
  if ((props.blocks.length > 0 || props.wires.length > 0) && !isGraphInitialized) {
    isGraphInitialized = true
    // 更新 viewState
    intent.initialize({
      blocks: props.blocks,
      wires: props.wires,
      blockTypes: props.blockTypes,
      name: props.initialName,
      description: props.initialDescription,
      workflowId: props.initialWorkflowId
    })
    workflowEditorModel.performActionWithoutHistory(() => {
      restoreGraph()
      // 判断节点坐标是不是都有值
      const nodes = Array.from(graph._nodes.values())
      if (nodes.some(node => node.pos[0] === 0 && node.pos[1] === 0)) {
        console.log('节点坐标为0，重新排列')
        graph.arrange()
      }
      console.log('[initGraphData] Graph initialized.')
    })
  }
}

const initPropertiesData = () => {
  viewState.value.name = props.initialName || ''
  viewState.value.description = props.initialDescription || ''
  viewState.value.workflowId = props.initialWorkflowId || ''

  formValue.value = {
    workflowId: props.initialWorkflowId || ':',
    name: props.initialName || '',
    description: props.initialDescription || ''
  }
  if (formValue.value.workflowId == ':') {
    formValue.value.workflowId = 'user:' + Array.from({ length: 5 }, () => Math.floor(Math.random() * 36).toString(36)).join('')
  }
}
// 监听 props 变化
watch([() => props.blocks, () => props.wires, () => props.blockTypes], initGraphData, { deep: true })
watch([() => props.initialName, () => props.initialDescription, () => props.initialWorkflowId], initPropertiesData, { deep: true })
// 初始化


onMounted(() => {
  initGraph()
  initGraphData()

  // 添加离开页面时的确认提示
  window.addEventListener('beforeunload', beforeunloadHandler)
})

const beforeunloadHandler = (event: BeforeUnloadEvent) => {
  event.preventDefault()
  event.returnValue = '您确定要离开此页面吗？未保存的更改可能会丢失。'
  return event.returnValue
}

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeunloadHandler)
})
</script>

<template>
  <div class="workflow-canvas">
    <div class="toolbar">
      <NSpace>
        <NTooltip placement="bottom" trigger="hover">
          <template #trigger>
            <NButton
              quaternary
              circle
              :loading="saving"
              @click="handleSave"
              class="toolbar-button"
            >
              <template #icon>
                <NIcon><SaveOutline /></NIcon>
              </template>
            </NButton>
          </template>
          <span>保存工作流</span>
        </NTooltip>
        <NTooltip placement="bottom" trigger="hover">
          <template #trigger>
            <NButton
              quaternary
              circle
              :loading="resetting"
              @click="handleReset"
              class="toolbar-button"
            >
              <template #icon>
                <NIcon><RefreshOutline /></NIcon>
              </template>
            </NButton>
          </template>
          <span>重置工作流</span>
        </NTooltip>
        <NTooltip placement="bottom" trigger="hover">
          <template #trigger>
            <NButton
              quaternary
              circle
              :loading="importing"
              @click="handleImport"
              class="toolbar-button"
            >
              <template #icon>
                <NIcon><DownloadOutline /></NIcon>
              </template>
            </NButton>
          </template>
          <span>导入工作流</span>
        </NTooltip>
        <NTooltip placement="bottom" trigger="hover">
          <template #trigger>
            <NButton
              quaternary
              circle
              @click="handleEditInfo"
              class="toolbar-button"
            >
              <template #icon>
                <NIcon><SettingsOutline /></NIcon>
              </template>
            </NButton>
          </template>
          <span>编辑工作流信息</span>
        </NTooltip>
      </NSpace>
    </div>

    <canvas ref="container" class="workflow-canvas" tabindex="0"></canvas>

    <NModal
      v-model:show="showSettingsModal"
      preset="card"
      title="工作流设置"
      class="settings-modal"
      :style="{ width: '600px' }"
    >
      <NForm
        ref="formRef"
        :model="formValue"
        :rules="formRules"
        label-placement="left"
        label-width="100"
        require-mark-placement="right-hanging"
        size="medium"
        class="settings-form"
      >
        <NFormItem label="工作流ID" path="workflowId">
          <NInput v-model:value="formValue.workflowId" placeholder="请输入 group_id:workflow_id" />
        </NFormItem>
        <NFormItem label="名称" path="name">
          <NInput v-model:value="formValue.name" placeholder="请输入工作流名称" />
        </NFormItem>
        <NFormItem label="描述" path="description">
          <NInput
            v-model:value="formValue.description"
            type="textarea"
            placeholder="请输入工作流描述"
          />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace justify="end">
          <NButton
            @click="showSettingsModal = false"
          >
            取消
          </NButton>
          <NButton
            type="primary"
            :loading="saving"
            @click="handleSave"
          >
            保存
          </NButton>
        </NSpace>
      </template>
    </NModal>
    <div
      v-if="props.loading"
      class="loading-overlay"
    >
      <NSpin size="large" />
  </div>
  </div>
</template>

<style>
@import '@comfyorg/litegraph/dist/css/litegraph.css';

.workflow-canvas {
  width: 100vw;
  height: calc(100vh - 28px);
  position: fixed;
  top: 0;
  left: 0;
  background: var(--background-color);
  overflow: hidden;
  z-index: 50;
}

.toolbar {
  position: absolute;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  justify-content: center;
}

.toolbar > * {
  margin: 0 0.5rem;
}

.toolbar-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.toolbar-button:hover {
  transform: translateY(-2px);
  background-color: rgba(0, 122, 255, 0.1);
}

.toolbar-button:active {
  transform: translateY(0);
}

.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.settings-modal {
  animation: fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-form {
  margin: 1rem 0;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 自定义 LiteGraph 节点样式 */
:deep(.litegraph) {
  --node-color: white;
  --node-color-selected: #e6f4ff;
  --node-border-radius: 8px;
  --node-title-color: #f0f0f0;
  --node-title-height: 30px;
  --node-padding: 12px;
  --node-title-text-color: #333;
  --node-text-color: #666;
  --node-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
}


.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  z-index: 200;
}
</style>