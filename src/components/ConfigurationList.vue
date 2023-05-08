<template>
  <div class="topbar">
    <p>{{ title.toLocaleUpperCase() }}</p>

    <n-space>
      <n-button @click="resetForm">
        <template #icon>
          <n-icon>
            <reload-icon />
          </n-icon>
        </template>
      </n-button>
      <n-button @click="saveToServer">
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
        <h2 style="text-align: left; padding: 16px 0;">{{ group.title }}</h2>
        <div style="margin-bottom: 20px;" v-for="(config, j) in group.properties" :key="j">
          <n-form-item :label="config.title" path="inputValue">
            <n-input v-model:value="configurationValue[j]" type="text" :placeholder="config.default" />
          </n-form-item>
          <p>{{ config.description }}</p>
          <n-divider></n-divider>
        </div>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { SaveOutline as SaveIcon, ReloadOutline as ReloadIcon } from '@vicons/ionicons5'
import { NDivider, NInput, NFormItem, NForm, NSpace, NButton, NIcon } from 'naive-ui'
import { ref, onUpdated } from 'vue'
import { useLoadingBar } from 'naive-ui'

export type Configuration = {
  title: string,
  isRequired: boolean,
  value: string,
  description: string
}
export type ConfigurationGroup = {
  title: string,
  properties: Array<Configuration>
}

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  }
})


const configurationGroups = ref([]);
const configurationValue = ref({});

const loadingBar = useLoadingBar();

const formRef = ref(null)


const resetForm = () => {
  // Reset form fields to their original values
  loadingBar.start()
  getConfigurationValue().then(() => {
    loadingBar.finish()
  }).catch(err => {
    loadingBar.error();
  })
}

const saveToServer = () => {
  // Save cloned model
  loadingBar.start()
  fetch('/backend-api/v1/config?key=' + props.path, {
    method: 'POST',
    body: JSON.stringify(configurationValue.value),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
    .then(res => {
      if (res.ok) {
        console.log('finish')

        loadingBar.finish()
        return res.text();
      }

      throw new Error('Something went wrong.');

    })
    .catch(err => {
      console.log('err')
      loadingBar.error()
    })
}
async function getConfigurationSchema() {
  const response = await fetch('/backend-api/v1/config?key=' + props.path + '&type=schema');
  const data = await response.json();
  configurationGroups.value = [data];
}

async function getConfigurationValue() {
  const response = await fetch('/backend-api/v1/config?key=' + props.path + '&type=value');
  const data = await response.json();
  configurationValue.value = data;
}
onUpdated(() => {
  getConfigurationSchema()
    .then(getConfigurationValue)
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

<!-- The reload button calls the resetForm function, which clones all configurations on reset and resets the form fields. The save button calls the saveToServer function, which sends a POST request to save the current cloned configurations to the server. -->
