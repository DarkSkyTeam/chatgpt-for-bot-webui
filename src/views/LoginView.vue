<template>
    <div class="login-view">
        <n-card class="login-card" :bordered="false">
            <div class="login-header">
                <div class="login-logo">
                    <div class="i-carbon-bot text-36px" />
                </div>
                <h1 class="login-title">ChatGPT Bot</h1>
            </div>
            
            <n-result
                v-if="isFirstTime"
                status="info"
                title="首次访问"
                description="请设置管理员密码"
            />
            <n-result
                v-else
                status="success"
                title="登录"
                description="请输入管理员密码"
            />
            
            <n-form
                ref="formRef"
                :model="formModel"
                :rules="rules"
                label-placement="left"
                label-width="0"
                require-mark-placement="right-hanging"
                size="large"
            >
                <n-form-item path="password">
                    <n-input
                        v-model:value="formModel.password"
                        type="password"
                        placeholder="请输入密码"
                        :maxlength="32"
                        show-password-on="click"
                    >
                        <template #prefix>
                            <div class="i-carbon-password" />
                        </template>
                    </n-input>
                </n-form-item>
                
                <n-form-item v-if="isFirstTime" path="confirmPassword">
                    <n-input
                        v-model:value="formModel.confirmPassword"
                        type="password"
                        placeholder="请确认密码"
                        :maxlength="32"
                        show-password-on="click"
                    >
                        <template #prefix>
                            <div class="i-carbon-password" />
                        </template>
                    </n-input>
                </n-form-item>
                
                <n-space vertical :size="24">
                    <n-button
                        type="primary"
                        size="large"
                        block
                        :loading="loading"
                        @click="handleSubmit"
                    >
                        {{ isFirstTime ? '设置密码' : '登录' }}
                    </n-button>
                </n-space>
            </n-form>
        </n-card>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, NSpace, NResult } from 'naive-ui'
import type { FormRules } from 'naive-ui'

const router = useRouter()
const isFirstTime = ref(false)
const loading = ref(false)
const formModel = ref({
    password: '',
    confirmPassword: ''
})

// 表单验证规则
const rules: FormRules = {
    password: [
        { required: true, message: '请输入密码' },
        { min: 6, message: '密码长度不能小于6位' }
    ],
    confirmPassword: [
        { 
            required: true, 
            message: '请确认密码',
            trigger: ['input', 'blur']
        },
        {
            validator: (rule, value) => {
                return value === formModel.value.password
            },
            message: '两次输入的密码不一致',
            trigger: ['input', 'blur']
        }
    ]
}

// 检查是否首次访问
const checkFirstTime = async () => {
    try {
        const response = await fetch('/backend-api/api/auth/login', {
            method: 'GET'
        })
        const data = await response.json()
        isFirstTime.value = response.status === 401 && data.error === 'No password set'
    } catch (error) {
        console.error('检查首次访问失败:', error)
    }
}

// 处理登录/设置密码
const handleSubmit = async () => {
    if (isFirstTime.value && formModel.value.password !== formModel.value.confirmPassword) {
        alert('两次输入的密码不一致')
        return
    }
    
    loading.value = true
    try {
        const response = await fetch('/backend-api/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: formModel.value.password
            })
        })
        
        const data = await response.json()
        if (response.ok) {
            localStorage.setItem('token', data.access_token)
            router.push('/')
        } else {
            alert(data.error || '登录失败')
        }
    } catch (error) {
        console.error('登录失败:', error)
        alert('登录失败，请重试')
    } finally {
        loading.value = false
    }
}

checkFirstTime()
</script>
  
<style scoped>
.login-view {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--n-color-1) 0%, var(--n-color-2) 100%);
}

.login-card {
    width: 100%;
    max-width: 360px;
    padding: 24px;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.8);
}

.login-header {
    text-align: center;
    margin-bottom: 24px;
}

.login-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
}

.login-title {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    color: var(--n-text-color);
}

:deep(.n-card-header) {
    text-align: center;
}

:deep(.n-result) {
    padding: 0 0 24px 0;
}

:deep(.n-input .n-input__prefix) {
    margin-right: 8px;
}
</style>