<template>
  <ConfigurationList title="OneBot 配置" :configurationGroups="configurationGroups" />
</template>

<script setup lang="ts">
import ConfigurationList, { Configuration, ConfigurationGroup } from '@/components/ConfigurationList.vue'
import { defineProps } from 'vue'

const configurations: Array<Configuration> = [
 {
  name: '管理员 QQ',
  isRequired: true,
  value: '0',
  description: '此 QQ 可以让机器人执行管理员指令。'
 },
 {
  name: '反向 WebSocket 端口',
  isRequired: false,
  value: '8556',
  description: '此端口将用于 go-cqhttp 连接。'
 }
]

const configurationGroups: Array<ConfigurationGroup> = [
 {
  title: '基本配置',
  configurations: configurations
 }
]
</script>

<style>
.topbar {
  background-color: var(--vt-c-white-mute);
  color: #fff;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
</style>
