<script setup lang="ts">
import { PersonAddOutline as AddIcon, TrashOutline as TrashIcon } from '@vicons/ionicons5'
import ConfigurationList from '@/components/ConfigurationList.vue'
import { useRouter } from 'vue-router'
import { NSpace, NButton, NIcon, useLoadingBar, useDialog, useMessage } from 'naive-ui'

import { getCurrentInstance, onMounted, onUpdated, ref } from 'vue'

const $router = useRouter()
const $message = useMessage()
const loadingBar = useLoadingBar();
const dialog = useDialog()

const selectAccountIndex = ref(-1)

const selectAccountModelName = ref('chatgpt-web')

const configurationGroups = ref([])
const accountList = ref({})

const newAccountModel = ref(null);

async function getConfigurationSchema() {
    const response = await fetch('/backend-api/v1/accounts/model?key=' + selectAccountModelName.value);
    const data = await response.json();
    delete data['properties']['ok']
    configurationGroups.value = [data];
}


async function getConfigurationValue() {
    const response = await fetch('/backend-api/v1/accounts/list');
    const data = await response.json();
    accountList.value = data;
    const instance = getCurrentInstance();
    instance?.proxy?.$forceUpdate();
}

function onAccountSelect(name: string, index: number) {
    selectAccountModelName.value = name
    selectAccountIndex.value = index
    resetConfig()
}

function resetConfig() {
    loadingBar.start()
    getConfigurationSchema().then(() => {
        if (newAccountModel.value) {
            newAccountModel.value = {}
            return Promise.resolve()
        } else {
            return getConfigurationValue()
        }
    })
        .then(() => {
            loadingBar.finish()
        })
        .catch((err) => {
            $message.error('配置读取失败！')
            console.error(err)
            loadingBar.error()
        })
}

function saveConfig(config: object) {
    loadingBar.start()
    const url = '/backend-api/v1/accounts/' + selectAccountModelName.value + (newAccountModel.value ? '' : ('/' + selectAccountIndex.value))
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(config),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    })
        .then(res => {
            if (res.ok) {
                $message.success('配置保存成功！')
                loadingBar.finish()
                return res.json();
            }
            throw new Error('Something went wrong.');
        })
        .then(getConfigurationValue)
        .catch(err => {
            $message.error('配置保存失败！')
            loadingBar.error()
        })
}

function addAccount(type: string) {
    selectAccountIndex.value = -1
    newAccountModel.value = {}
    selectAccountModelName.value = type
    getConfigurationSchema()
}

function deleteAccount(type: string, index: Number) {
    dialog.warning({
        title: '删除账号',
        content: '你确定要删除这个账号吗？希望你不是点错了。',
        positiveText: '很确定',
        negativeText: '点错了',
        onPositiveClick: () => {
            selectAccountIndex.value = -1
            newAccountModel.value = null
            fetch('/backend-api/v1/accounts/' + selectAccountModelName.value + '/' + selectAccountIndex.value, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            })
                .then(res => {
                    if (res.ok) {
                        $message.success('账号已删除')
                        loadingBar.finish()
                        return res.json();
                    }
                    throw new Error('Something went wrong.');
                })
                .then(getConfigurationValue)
                .catch(err => {
                    $message.error('账号删除失败')
                    loadingBar.error()
                })
        }
    })
}
resetConfig()
</script>

<template>
    <div class="sub-content-wrapper">
        <div class="sidebar-wrapper">
            <div class="sidebar-title">
                <p>账号管理</p>
            </div>
            <div class="sidebar">
                <ul class="sidebar-nav">
                    <li v-for="type in Object.keys(accountList)" :key="type">
                        <div class="sidebar-nav-item">
                            <div class="sidebar-nav-text">{{ type }}</div>
                            <n-space class="sidebar-nav-action">
                                <n-button quaternary size="tiny" @click="addAccount(type)">
                                    <template #icon>
                                        <n-icon>
                                            <add-icon />
                                        </n-icon>
                                    </template>
                                </n-button>
                            </n-space>
                        </div>
                        <!-- nested sidebar -->
                        <ul class="sidebar-nav-child">
                            <li :class="{'sidebar-nav-sub-item': true, 'sidebar-nav-sub-item-active': selectAccountIndex == childIndex && selectAccountModelName == type}" v-for="(account, childIndex) in accountList[type]"
                                @click="onAccountSelect(type, childIndex)" :key="childIndex">
                                <div>
                                    <p class="account-remark">账号 {{ childIndex + 1 }}</p>
                                    <p class="account-status" style="color: mediumseagreen" v-if="account.ok">可用</p>
                                    <p class="account-status" style="color:brown" v-else>不可用</p>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
        <div class="sub-main-content-wrapper" v-if="selectAccountIndex >= 0">
            <ConfigurationList title="修改账号" :configuration-groups="configurationGroups"
                :configurationValue="accountList[selectAccountModelName][selectAccountIndex]" @save="saveConfig"
                @reset="resetConfig">
                <template v-slot:tools>
                    <n-button quaternary @click="deleteAccount(selectAccountModelName, selectAccountIndex)">
                        <template #icon>
                            <n-icon>
                                <TrashIcon />
                            </n-icon>
                        </template>
                    </n-button>
                </template>
            </ConfigurationList>
        </div>
        <div class="sub-main-content-wrapper" v-else-if="newAccountModel">
            <ConfigurationList :title="'添加账号：' + selectAccountModelName" :configuration-groups="configurationGroups"
                :configurationValue="newAccountModel" @save="saveConfig" @reset="resetConfig"></ConfigurationList>
        </div>
    </div>
</template>
<style scoped>
.sub-content-wrapper {
    display: flex;
    flex-grow: 1;
    height: 100%;
}

.sidebar-wrapper {
    width: 256px;
    background-color: var(--vt-c-gray);
}

.sub-main-content-wrapper {
    flex-grow: 1;
    /* padding: 16px; */
}

.account-remark {
    font-weight: 500;
}

.account-status {
    font-size: 0.9em;
}
</style>
