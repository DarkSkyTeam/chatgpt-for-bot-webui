<template>
   <div class="topbar">
      <p>{{ title }}</p>

  <n-space>
    <n-button>
      <template #icon>
        <n-icon>
          <reload-icon />
        </n-icon>
      </template>
    </n-button>
    <n-button>
      <template #icon>
        <n-icon>
          <save-icon />
        </n-icon>
      </template>
    </n-button>
  </n-space>
   </div>

   <div style="max-width: 66%; margin: 0 auto; padding-top: 16px">
    <n-form ref="formRef" label-placement="left">
     <div v-for="(group, i) in configurationGroups" :key="i">
      <h2 style="text-align: left; padding: 16px 0;">{{group.title}}</h2>
      <div style="margin-bottom: 20px;" v-for="(config, j) in group.configurations" :key="j">
       <n-form-item :label="config.name" path="inputValue">
        <n-input v-model:value="config.value" type="text" placeholder="基本的 Input" />
       </n-form-item>
       <p>{{config.description}}</p>
       <n-divider></n-divider>
      </div>
     </div>
    </n-form>
   </div>
  </template>
  
  <script setup lang="ts">
  import { SaveOutline as SaveIcon, ReloadOutline as ReloadIcon } from '@vicons/ionicons5'
  import {NDivider, NInput, NFormItem, NForm, NSpace, NButton, NIcon} from 'naive-ui'
  
  export type Configuration = {
    name: string,
    isRequired: boolean,
    value: string,
    description: string
  }
  export type ConfigurationGroup = {
    title: string,
    configurations: Array<Configuration>
  }
  
  const props = defineProps({
    configurationGroups: {
      type: Array as () => Array<ConfigurationGroup>,
      required: true
    },
    title: {
      type: String,
      required: true
    }
  })
  
  </script>
  <style scoped>
  
  .topbar {
    background-color: var(--vt-c-white-mute);
    color: #111;
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
  }

  ul {
  list-style: none;
  display: flex;
}

li {
  margin-right: 20px;
}

a {
  color: #111;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
  </style>
