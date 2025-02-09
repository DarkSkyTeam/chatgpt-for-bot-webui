<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NDataTable, NButton, NSpace, NCard, NForm, NFormItem, NInput, NInputNumber, NSelect, NSwitch, useMessage, NModal, NDivider } from 'naive-ui'
import { dispatchApi } from '@/api/dispatch'
import type { DispatchRule } from '@/api/dispatch'
import DynamicConfigForm from '@/components/form/DynamicConfigForm.vue'
import type { Schema } from '@/components/form/types'

const message = useMessage()
const rules = ref<DispatchRule[]>([])
const ruleTypes = ref<string[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const currentRule = ref<Partial<DispatchRule>>({})
const configSchema = ref<Schema | null>(null)

// 表格列定义
const columns = [
    { title: '规则ID', key: 'rule_id' },
    { title: '名称', key: 'name' },
    { title: '描述', key: 'description' },
    { title: '类型', key: 'type' },
    { title: '优先级', key: 'priority' },
    { title: '工作流', key: 'workflow_id' },
    {
        title: '状态',
        key: 'enabled',
        render: (row: DispatchRule) => {
            return h(NSwitch, {
                value: row.enabled,
                onUpdateValue: async (value) => {
                    try {
                        if (value) {
                            await dispatchApi.enableRule(row.rule_id)
                        } else {
                            await dispatchApi.disableRule(row.rule_id)
                        }
                        await loadRules()
                        message.success('操作成功')
                    } catch (error) {
                        message.error('操作失败')
                    }
                }
            })
        }
    },
    {
        title: '操作',
        key: 'actions',
        render: (row: DispatchRule) => {
            return h(NSpace, null, {
                default: () => [
                    h(NButton, {
                        size: 'small',
                        onClick: () => editRule(row)
                    }, { default: () => '编辑' }),
                    h(NButton, {
                        size: 'small',
                        type: 'error',
                        onClick: () => deleteRule(row.rule_id)
                    }, { default: () => '删除' })
                ]
            })
        }
    }
]

// 加载规则列表
const loadRules = async () => {
    try {
        const { rules: ruleList } = await dispatchApi.getRules()
        rules.value = ruleList
    } catch (error) {
        message.error('加载规则列表失败')
    }
}

// 加载规则类型
const loadRuleTypes = async () => {
    try {
        const { types } = await dispatchApi.getRuleTypes()
        ruleTypes.value = types
    } catch (error) {
        message.error('加载规则类型失败')
    }
}

// 加载规则配置模式
const loadConfigSchema = async (type: string) => {
    try {
        const { configSchema: schema } = await dispatchApi.getRuleConfigSchema(type)
        configSchema.value = schema
    } catch (error) {
        message.error('加载配置模式失败')
    }
}

// 创建规则
const createRule = () => {
    currentRule.value = {
        priority: 5,
        enabled: true,
        config: {},
        metadata: {}
    }
    showCreateModal.value = true
}

// 编辑规则
const editRule = (rule: DispatchRule) => {
    currentRule.value = {
        ...rule,
        config: rule.config || {},
        metadata: rule.metadata || {}
    }
    showEditModal.value = true
    loadConfigSchema(rule.type)
}

// 删除规则
const deleteRule = async (ruleId: string) => {
    try {
        await dispatchApi.deleteRule(ruleId)
        await loadRules()
        message.success('删除成功')
    } catch (error) {
        message.error('删除失败')
    }
}

// 保存规则
const saveRule = async (isCreate: boolean) => {
    try {
        if (isCreate) {
            await dispatchApi.createRule(currentRule.value)
        } else {
            await dispatchApi.updateRule(currentRule.value.rule_id!, currentRule.value)
        }
        await loadRules()
        showCreateModal.value = false
        showEditModal.value = false
        message.success('保存成功')
    } catch (error) {
        message.error('保存失败')
    }
}

// 监听规则类型变化
const handleTypeChange = async (type: string) => {
    currentRule.value.type = type
    await loadConfigSchema(type)
}

onMounted(async () => {
    await Promise.all([loadRules(), loadRuleTypes()])
})
</script>

<template>
    <div class="dispatch-rules">
        <n-space vertical>
            <n-space>
                <n-button type="primary" @click="createRule">
                    创建规则
                </n-button>
            </n-space>

            <n-data-table :columns="columns" :data="rules" :bordered="false" :single-line="false" />

            <!-- 创建规则对话框 -->
            <n-modal v-model:show="showCreateModal" preset="dialog" title="创建规则">
                <n-form>
                    <n-form-item label="规则ID" required>
                        <n-input v-model:value="currentRule.rule_id" placeholder="请输入规则ID" />
                    </n-form-item>
                    <n-form-item label="名称" required>
                        <n-input v-model:value="currentRule.name" placeholder="请输入名称" />
                    </n-form-item>
                    <n-form-item label="描述">
                        <n-input v-model:value="currentRule.description" type="textarea" placeholder="请输入描述" />
                    </n-form-item>
                    <n-form-item label="类型" required>
                        <n-select v-model:value="currentRule.type"
                            :options="ruleTypes.map(type => ({ label: type, value: type }))" placeholder="请选择类型"
                            @update:value="handleTypeChange" />
                    </n-form-item>
                    <n-form-item label="优先级" required>
                        <n-input-number v-model:value="currentRule.priority" :min="0" :max="100" />
                    </n-form-item>
                    <n-form-item label="工作流ID" required>
                        <n-input v-model:value="currentRule.workflow_id" placeholder="请输入工作流ID" />
                    </n-form-item>
                    <n-form-item label="启用状态">
                        <n-switch v-model:value="currentRule.enabled" />
                    </n-form-item>
                    <n-form-item v-if="configSchema" label="配置">
                        <dynamic-config-form v-model="currentRule.config" :schema="configSchema" />
                    </n-form-item>
                </n-form>
                <template #action>
                    <n-button type="primary" @click="saveRule(true)">
                        确定
                    </n-button>
                </template>
            </n-modal>

            <!-- 编辑规则对话框 -->
            <n-modal v-model:show="showEditModal" preset="dialog" title="编辑规则" style="width: 900px">
                <div class="rule-edit-container">
                    <div class="rule-basic-form">
                        <n-form label-placement="left" label-width="80">
                            <n-form-item label="规则ID" required>
                                <n-input v-model:value="currentRule.rule_id" :disabled="true" />
                            </n-form-item>
                            <n-form-item label="名称" required>
                                <n-input v-model:value="currentRule.name" placeholder="请输入名称" />
                            </n-form-item>
                            <n-form-item label="描述">
                                <n-input v-model:value="currentRule.description" type="textarea" placeholder="请输入描述" />
                            </n-form-item>
                            <n-form-item label="类型" required>
                                <n-select v-model:value="currentRule.type"
                                    :options="ruleTypes.map(type => ({ label: type, value: type }))" 
                                    placeholder="请选择类型"
                                    @update:value="handleTypeChange" />
                            </n-form-item>
                            <n-form-item label="优先级" required>
                                <n-input-number v-model:value="currentRule.priority" :min="0" :max="100" />
                            </n-form-item>
                            <n-form-item label="工作流ID" required>
                                <n-input v-model:value="currentRule.workflow_id" placeholder="请输入工作流ID" />
                            </n-form-item>
                            <n-form-item label="启用状态">
                                <n-switch v-model:value="currentRule.enabled" />
                            </n-form-item>
                        </n-form>
                    </div>
                    <div v-if="configSchema && currentRule.config" class="rule-config-form">
                        <n-divider vertical />
                        <div class="config-form-container">
                            <h3 class="config-title">规则配置</h3>
                            <dynamic-config-form v-model="currentRule.config" :schema="configSchema" />
                        </div>
                    </div>
                </div>
                <template #action>
                    <n-button type="primary" @click="saveRule(false)">
                        确定
                    </n-button>
                </template>
            </n-modal>
        </n-space>
    </div>
</template>

<style scoped>
.dispatch-rules {
    padding: 16px;
}

.rule-edit-container {
    display: flex;
    min-height: 400px;
}

.rule-basic-form {
    flex: 0 0 360px;
    padding-right: 16px;
}

.rule-config-form {
    flex: 1;
    display: flex;
    min-width: 0; /* 防止flex子项溢出 */
}

.config-form-container {
    flex: 1;
    padding-left: 16px;
    overflow: auto;
}

.config-title {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--n-text-color);
}

:deep(.n-form-item .n-form-item-label) {
    font-weight: 500;
}

:deep(.n-input-number) {
    width: 100%;
}
</style>