<script setup lang="ts">
import { watch, h } from 'vue'
import { NFormItem, NInput, NInputNumber, NSwitch, NSelect, NTooltip, NText, NButton, NIcon } from 'naive-ui'
import type { PropType } from 'vue'
import { CloseOutline, AddOutline } from '@vicons/ionicons5'


interface SchemaProperty {
    title: string
    type: string
    description?: string
    default?: any
    minimum?: number
    maximum?: number
    enum?: any[]
    enumNames?: string[]
    items?: {
        type: string
        enum?: any[]
        enumNames?: string[]
        minimum?: number
        maximum?: number
        default?: any
    }
    $ref?: string
}

interface Schema {
    title: string
    type: string
    properties: Record<string, SchemaProperty>
    required?: string[]
    $defs?: Record<string, SchemaProperty>
}

const props = defineProps({
    schema: {
        type: Object as PropType<Schema>,
        required: true
    },
    modelValue: {
        type: Object as PropType<Record<string, any>>,
        required: true
    }
})

const updateValue = (key: string, value: any) => {
    emit('update:modelValue', {
        ...props.modelValue,
        [key]: value
    })
}
const emit = defineEmits(['update:modelValue'])

const renderInputComponent = (itemType: string, property: SchemaProperty, itemValue: any, updateItemValue: (val: any) => void) => {
    const commonProps = {
        value: itemValue,
        placeholder: property.default !== undefined ? property.default : '',
        onUpdateValue: updateItemValue
    }

    switch (itemType) {
        case 'string':
            return h(NInput, {
                ...commonProps,
                type: 'text',
            })
        case 'number':
        case 'integer':
            return h(NInputNumber, {
                ...commonProps,
                min: property.minimum,
                max: property.maximum,
            })
        case 'boolean':
            return h(NSwitch, {
                ...commonProps,
            })
        default:
            return h(NText, { content: `不支持的类型: ${itemType}` })
    }
}

const renderField = (key: string, property: SchemaProperty) => {
    const value = props.modelValue[key]
    const required = props.schema.required?.includes(key)

    // 处理$ref引用
    if (property.$ref && !property.type) {
        const refPath = property.$ref.split('/')
        if (refPath[0] === '#' && refPath[1] === '$defs') {
            const defName = refPath[2]
            const refProperty = props.schema.$defs?.[defName]
            if (refProperty) {
                // 如果引用属性有enum，则使用引用属性的配置
                if (refProperty.enum) {
                    return h(NFormItem, { label: property.title, required: required }, {
                        default: () => h(NSelect, {
                            value: value,
                            options: refProperty.enum?.map((value, index) => ({
                                label: refProperty.enumNames?.[index] || value,
                                value
                            })),
                            placeholder: '',
                            onUpdateValue: (val) => updateValue(key, val)
                        })
                    })
                }
                // 否则合并属性
                property = {
                    ...property,
                    ...refProperty
                }
            }
        }
    }

    const hint = property.description ? h(NTooltip, { content: property.description }, { default: () => property.title }) : property.title;

    if (property.items && property.type === 'array' && property.items.type) {
        const itemType = property.items.type
        const arrayValue = value as any[] || []

        const renderArrayItem = (index: number) => {
            const itemValue = arrayValue[index]
            const removeItem = () => {
                arrayValue.splice(index, 1)
                updateValue(key, arrayValue.length > 0 ? arrayValue : undefined)
            }

            const updateItemValue = (val: any) => {
                arrayValue[index] = val
                updateValue(key, arrayValue)
            }

            const inputComponent = renderInputComponent(itemType, property.items, itemValue, updateItemValue)

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
                h('div', { style: { flex: 1 } }, [inputComponent]),
                h(NButton, { 
                    type: 'error', 
                    size: 'tiny',
                    quaternary: true,
                    onClick: removeItem,
                }, {
                    default: () => h(NIcon, null, { default: () => h(CloseOutline) })
                })
            ])
        }

        const addArrayItem = () => {
            const defaultValue = property.items?.default !== undefined ? property.items.default : null
            arrayValue.push(defaultValue)
            updateValue(key, arrayValue)
        }

        return h('div', null, [
            h(NFormItem, { 
                label: property.title,
                required: required,
            }, {
                default: () => h('div', { 
                    style: { 
                        padding: '8px 0'
                    } 
                }, [
                    ...(arrayValue.length > 0 
                        ? arrayValue.map((_, index) => renderArrayItem(index))
                        : [h('div', { 
                            style: { 
                                color: 'var(--n-text-color-3)',
                                fontStyle: 'italic',
                                padding: '4px 0'
                            } 
                        }, '暂无数据')]),
                    h(NButton, { 
                        type: 'primary',
                        size: 'small',
                        dashed: true,
                        style: { width: '100%', marginTop: '8px' },
                        onClick: addArrayItem 
                    }, {
                        default: () => [
                            h(NIcon, null, { default: () => h(AddOutline) }),
                            ' 添加'
                        ]
                    })
                ])
            })
        ])
    }

    switch (property.type) {
        case 'string':
            if (property.enum) {
                return h(NFormItem, { label: property.title, required: required }, {
                    default: () => h(NSelect, {
                        value: value,
                        options: property.enum?.map((value, index) => ({
                            label: property.enumNames?.[index] || value,
                            value
                        })),
                        placeholder: '',
                        onUpdateValue: (val) => updateValue(key, val)
                    })
                })
            }
            return h(NFormItem, { label: property.title, required: required }, {
                default: () => h(NInput, {
                    value: value,
                    type: key.toLowerCase().includes('password') ? 'password' : 'text',
                    placeholder: property.default !== undefined ? property.default : '',
                    onUpdateValue: (val) => updateValue(key, val)
                })
            })
        case 'number':
        case 'integer':
            return h(NFormItem, { label: property.title, required: required }, {
                default: () => h(NInputNumber, {
                    value: value,
                    min: property.minimum,
                    max: property.maximum,
                    placeholder: property.default !== undefined ? property.default.toString() : '',
                    onUpdateValue: (val) => updateValue(key, val)
                })
            })
        case 'boolean':
            return h(NFormItem, { label: property.title, required: required }, {
                default: () => h(NSwitch, {
                    value: value,
                    onUpdateValue: (val) => updateValue(key, val)
                })
            })

        default:
            console.error(`不支持的类型: ${property.type}`)
            return h(NText, { content: `不支持的类型: ${property.type}` })
    }
}
</script> 

<template>
    <div class="dynamic-config-form">
        <template v-for="(property, key) in schema.properties" :key="key">
            <component :is="renderField(key, property)" />
        </template>
        <p v-if="Object.keys(schema.properties).length === 0">暂无配置，请关闭本窗口</p>
    </div>
</template>

<style scoped>
.dynamic-config-form {
    width: 100%;
}
</style>