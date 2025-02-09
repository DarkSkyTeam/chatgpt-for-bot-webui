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
        status="warning"
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
            :status="passwordFeedback"
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
            @click="handleLogin"
          >
            {{ isFirstTime ? '设置密码' : '登录' }}
          </n-button>
          <div style="text-align: right;">
            <n-tooltip trigger="hover" placement="bottom">
              <template #trigger>
                <span style="color: var(--n-info-color); cursor: pointer;">
                  忘记密码？
                </span>
              </template>
              <span>删除项目下的 data\web\password.hash 文件即可重置密码。</span>
            </n-tooltip>
          </div>
        </n-space>
      </n-form>
    </n-card>
    <div class="login-footer">
    <a href="https://github.com/lss233/chatgpt-mirai-qq-bot" target="_blank" style="color: var(--n-info-color);">
      Powered by ChatGPT Mirai QQ Bot
    </a>
  </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSpace,
  NResult,
  NTooltip,
  useMessage,
} from 'naive-ui'
import { useLoginViewModel } from './login.vm'

const {
  isFirstTime,
  loading,
  formModel,
  rules,
  handleSubmit,
  checkFirstTime
} = useLoginViewModel()

const message = useMessage()
const passwordFeedback = ref<string | undefined>(undefined)

const handleLogin = async () => {
  try {
    passwordFeedback.value = undefined
    await handleSubmit();
  } catch (error: any) {
    passwordFeedback.value = 'error'
    message.error('登录失败，请重试');
  }
};

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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
}

.login-card {
  width: 100%;
  max-width: 360px;
  padding: 24px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

.login-footer {
  text-align: center;
  margin-top: 24px;
  position: absolute;
  bottom: 10px;
  width: 100%;
}
.login-footer a:hover {
  color: var(--n-info-color);
  background-color: unset;
}

:deep(.n-button--primary) {
  background-color: var(--n-info-color);
  border-color: var(--n-info-color);
  color: #fff;
}

:deep(.n-button--primary:hover) {
  background-color: var(--n-info-color-hover);
  border-color: var(--n-info-color-hover);
}

:deep(.n-button--primary:active) {
  background-color: var(--n-info-color-pressed);
  border-color: var(--n-info-color-pressed);
}
</style> 