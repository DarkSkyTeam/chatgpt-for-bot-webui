<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NCard, NSpace, NButton, NGrid, NGridItem, NTag, NInput, NPagination, NEmpty, NLoadingBarProvider, useLoadingBar, NMessageProvider, useMessage, NSkeleton, NSwitch } from 'naive-ui'
import { pluginApi } from '@/api/plugin'
import type { MarketPlugin } from '@/api/plugin'

const loadingBar = useLoadingBar()
const message = useMessage()
const plugins = ref<MarketPlugin[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const loading = ref(false)
const skeletonVisible = ref(true)
const isFirstLoad = ref(true)
const operationStates = ref<Record<string, { loading: boolean, operation: 'install' | 'uninstall' | 'update' | 'toggle' | null }>>({})

const isOperating = (plugin: MarketPlugin) => {
  return operationStates.value[plugin.pypiPackage]?.loading || false
}

const getCurrentOperation = (plugin: MarketPlugin) => {
  return operationStates.value[plugin.pypiPackage]?.operation || null
}

const setOperationState = (plugin: MarketPlugin, operation: 'install' | 'uninstall' | 'update' | 'toggle' | null, loading: boolean) => {
  operationStates.value[plugin.pypiPackage] = { loading, operation }
}

const skeletonPlugins = Array(pageSize.value).fill({
  name: 'Plugin Name',
  description: 'This is a plugin description that shows how the content will look like when loaded.',
  author: 'Author Name',
  pypiPackage: 'package-name',
  pypiInfo: {
    version: '1.0.0',
    homePage: '#'
  }
})

const fetchPlugins = async () => {
  loading.value = true
  skeletonVisible.value = isFirstLoad.value

  loadingBar.start()
  try {
    const response = await pluginApi.searchPlugins(
      searchQuery.value,
      currentPage.value,
      pageSize.value
    )
    plugins.value = response.plugins
    totalCount.value = response.totalCount
  } catch (error) {
    console.error('获取插件列表失败:', error)
    message.error('获取插件列表失败')
  } finally {
    loading.value = false
    if (isFirstLoad.value) {
      skeletonVisible.value = false
      isFirstLoad.value = false
    }
    loadingBar.finish()
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPlugins()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchPlugins()
}

const handleInstall = async (plugin: MarketPlugin) => {
  if (isOperating(plugin)) {
    return
  }

  setOperationState(plugin, 'install', true)
  loadingBar.start()
  try {
    await pluginApi.installPlugin(plugin.pypiPackage)
    message.success('插件安装成功')
    await fetchPlugins()
  } catch (error) {
    console.error('安装插件失败:', error)
    message.error('插件安装失败')
  } finally {
    setOperationState(plugin, null, false)
    loadingBar.finish()
  }
}

const handleUpdate = async (plugin: MarketPlugin) => {
  if (isOperating(plugin)) {
    return
  }

  setOperationState(plugin, 'update', true)
  loadingBar.start()
  try {
    await pluginApi.updatePlugin(plugin.name)
    message.success('插件更新成功')
    await fetchPlugins()
  } catch (error) {
    console.error('更新插件失败:', error)
    message.error('插件更新失败')
  } finally {
    setOperationState(plugin, null, false)
    loadingBar.finish()
  }
}

const handleUninstall = async (plugin: MarketPlugin) => {
  if (isOperating(plugin)) {
    return
  }

  setOperationState(plugin, 'uninstall', true)
  loadingBar.start()
  try {
    await pluginApi.uninstallPlugin(plugin.name)
    message.success('插件卸载成功')
    await fetchPlugins()
  } catch (error) {
    console.error('卸载插件失败:', error)
    message.error('插件卸载失败')
  } finally {
    setOperationState(plugin, null, false)
    loadingBar.finish()
  }
}

const handleToggleStatus = async (plugin: MarketPlugin) => {
  if (isOperating(plugin)) {
    return
  }

  setOperationState(plugin, 'toggle', true)
  loadingBar.start()
  try {
    await pluginApi.togglePlugin(plugin.name, !plugin.isEnabled)
    message.success(`插件${plugin.isEnabled ? '禁用' : '启用'}成功`)
    await fetchPlugins()
  } catch (error) {
    console.error('切换插件状态失败:', error)
    message.error('切换插件状态失败')
  } finally {
    setOperationState(plugin, null, false)
    loadingBar.finish()
  }
}

onMounted(() => {
  fetchPlugins()
})
</script>

<template>
  <n-message-provider>
    <n-loading-bar-provider>
      <div class="plugin-market">
        <div class="market-header">
          <h1 class="market-title">插件市场</h1>
          <div class="search-container">
            <n-input v-model:value="searchQuery" placeholder="搜索插件..." class="search-input" @keyup.enter="handleSearch">
              <template #prefix>
                <div class="i-carbon-search" />
              </template>
            </n-input>
            <n-button type="primary" ghost @click="handleSearch" :disabled="loading">
              搜索
            </n-button>
          </div>
        </div>

        <div class="market-content">
          <div class="plugins-grid">
            <template v-if="skeletonVisible">
              <n-card v-for="plugin in skeletonPlugins" :key="plugin.pypiPackage" size="small" class="plugin-card"
                :bordered="true">
                <n-skeleton text style="width: 60%" :sharp="false">
                  <template #default>
                    <div class="plugin-header">
                      <div class="plugin-title">
                        <h3>{{ plugin.name }}</h3>
                        <div class="plugin-tags">
                          <n-tag size="small" type="success" class="version-tag">
                            v{{ plugin.pypiInfo.version }}
                          </n-tag>
                        </div>
                      </div>
                    </div>
                  </template>
                </n-skeleton>

                <n-skeleton text :repeat="2" :sharp="false" style="margin: 16px 0">
                  <template #default>
                    <div class="plugin-description">{{ plugin.description }}</div>
                  </template>
                </n-skeleton>

                <n-skeleton text style="width: 80%" :sharp="false">
                  <template #default>
                    <div class="plugin-meta">
                      <n-space align="center" :size="12">
                        <span>作者: {{ plugin.author }}</span>
                        <span class="separator">·</span>
                        <span>PyPI: {{ plugin.pypiPackage }}</span>
                      </n-space>
                    </div>
                  </template>
                </n-skeleton>

                <n-skeleton text style="width: 30%; margin-left: auto" :sharp="false">
                  <template #default>
                    <div class="plugin-actions">
                      <n-button type="primary">安装</n-button>
                    </div>
                  </template>
                </n-skeleton>
              </n-card>
            </template>

            <template v-else-if="plugins.length > 0">
              <n-card v-for="plugin in plugins" :key="plugin.pypiPackage" size="small" class="plugin-card"
                :bordered="true">
                <div class="plugin-header">
                  <div class="plugin-title">
                    <h3>{{ plugin.name }}</h3>
                    <div class="plugin-tags">
                      <template v-if="plugin.isInstalled">
                        <n-tag v-if="plugin.isInstalled" size="small" type="info" class="status-tag">
                          已安装 v{{ plugin.installedVersion }}
                        </n-tag>

                        <n-tag v-if="plugin.isUpgradable" size="small" type="warning" class="status-tag">
                          可更新
                        </n-tag>

                        <n-tag v-if="plugin.isEnabled" size="small" type="success" class="status-tag">
                          已启用
                        </n-tag>
                        <n-tag v-else size="small" type="error" class="status-tag">
                          已禁用
                        </n-tag>
                      </template>
                    </div>
                  </div>
                </div>

                <div class="plugin-description">{{ plugin.description }}</div>

                <div class="plugin-meta">
                  <n-space :size="12" vertical>
                    <n-space align="center" :size="12">
                      <span>作者: {{ plugin.author }}</span>
                      <span class="separator">·</span>
                      <span>PyPI: {{ plugin.pypiPackage }}</span>
                    </n-space>
                    <n-space align="center" :size="12">
                      <span>最新版本：v{{ plugin.pypiInfo.version }}</span>
                    </n-space>
                  </n-space>
                </div>

                <div class="plugin-actions">
                  <n-space align="center" :size="12">
                    <n-button v-if="plugin.pypiInfo.homePage" tag="a" :href="plugin.pypiInfo.homePage" target="_blank"
                      text class="homepage-link">
                      主页
                    </n-button>
                    <template v-if="plugin.isInstalled">
                      <n-space :size="12">
                        <n-button :type="plugin.isEnabled ? 'error' : 'primary'" size="small"
                          :loading="getCurrentOperation(plugin) === 'toggle'" :disabled="isOperating(plugin)"
                          @click="handleToggleStatus(plugin)" class="action-button">
                          {{ plugin.isEnabled ? '禁用' : '启用' }}
                        </n-button>
                        <n-button v-if="plugin.isUpgradable" type="info" ghost size="small"
                          :loading="getCurrentOperation(plugin) === 'update'" :disabled="isOperating(plugin)"
                          @click="handleUpdate(plugin)" class="action-button">
                          {{ getCurrentOperation(plugin) === 'update' ? '更新中' : '更新' }}
                        </n-button>
                        <n-button type="error" ghost size="small" :loading="getCurrentOperation(plugin) === 'uninstall'"
                          :disabled="isOperating(plugin)" @click="handleUninstall(plugin)" class="action-button">
                          卸载
                        </n-button>
                      </n-space>
                    </template>
                    <n-button v-else type="primary" size="small" :loading="getCurrentOperation(plugin) === 'install'"
                      :disabled="isOperating(plugin)" @click="handleInstall(plugin)"
                      class="action-button install-button">
                      {{ getCurrentOperation(plugin) === 'install' ? '安装中' : '安装' }}
                    </n-button>
                  </n-space>
                </div>
              </n-card>
            </template>

          </div>
          <n-empty v-if="plugins.length === 0 && !skeletonVisible" description="暂无插件" style="margin: auto;" />

        </div>

        <div class="pagination-container">
          <n-pagination v-if="totalCount > 0" v-model:page="currentPage" :page-size="pageSize" :item-count="totalCount"
            @update:page="handlePageChange" />
        </div>
      </div>
    </n-loading-bar-provider>
  </n-message-provider>
</template>

<style scoped>
.plugin-market {
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.market-header {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.market-title {
  font-size: 18px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0;
}

.search-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 240px;
}

.market-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.plugins-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  padding: 0 48px;
  margin-bottom: 24px;
}

.plugin-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  transition: background-color 0.2s ease;
  height: 100%;
}

.plugin-card-wrapper {
  height: 100%;
}

.plugin-header {
  margin-bottom: 12px;
}

.plugin-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.plugin-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #1d1d1f;
}

.plugin-tags {
  display: flex;
  gap: 8px;
}

.version-tag,
.status-tag {
  font-weight: 500;
}

.plugin-description {
  font-size: 14px;
  line-height: 1.5;
  color: #424245;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plugin-meta {
  font-size: 12px;
  color: #86868b;
  margin-bottom: 16px;
}

.separator {
  color: #d2d2d7;
}

.plugin-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
  gap: 12px;
}

.plugin-actions .n-button {
  font-size: 13px;
  padding: 4px 12px;
  height: 28px;
  line-height: 20px;
  position: relative;
  min-width: 72px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.plugin-actions .n-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.plugin-actions .n-button--loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(1px);
  border-radius: inherit;
}

.plugin-actions .install-button {
  background: linear-gradient(to right, #0066cc, #0052a3);
  border: none;
  color: #ffffff;
  font-weight: 600;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.plugin-actions .install-button:not(:disabled):hover {
  background: linear-gradient(to right, #0052a3, #003d7a);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.plugin-actions .install-button:not(:disabled):active {
  background: linear-gradient(to right, #003d7a, #002952);
  box-shadow: none;
}

.homepage-link {
  font-size: 13px;
  color: #0066cc;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.homepage-link:hover {
  text-decoration: none;
  background-color: rgba(0, 102, 204, 0.1);
}

.homepage-link:active {
  background-color: rgba(0, 102, 204, 0.2);
}

.plugin-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plugin-status .n-switch {
  margin-right: 8px;
}

.version-tag,
.status-tag {
  font-weight: 500;
}

.plugin-tags {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.plugin-meta {
  font-size: 12px;
  color: #86868b;
  margin: 12px 0;
}

.separator {
  color: #d2d2d7;
}

.plugin-description {
  font-size: 14px;
  line-height: 1.5;
  color: #424245;
  margin: 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pagination-container {
  padding: 24px 0;
  display: flex;
  justify-content: center;
  position: sticky;
  bottom: 0;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
}
</style>