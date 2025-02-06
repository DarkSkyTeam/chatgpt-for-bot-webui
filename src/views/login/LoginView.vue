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
import { onMounted } from 'vue'
import { NCard, NForm, NFormItem, NInput, NButton, NSpace, NResult } from 'naive-ui'
import { useLoginViewModel } from './login.vm'

const {
  isFirstTime,
  loading,
  formModel,
  rules,
  handleSubmit,
  checkFirstTime
} = useLoginViewModel()

onMounted(() => {
  checkFirstTime()
})
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