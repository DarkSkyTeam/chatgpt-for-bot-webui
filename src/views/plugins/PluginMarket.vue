<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NSpace, NButton, NGrid, NGridItem, NTag, NInput } from 'naive-ui'

interface MarketPlugin {
  name: string
  package_name: string
  description: string
  version: string
  author: string
  homepage?: string
  license?: string
  downloads: number
  rating: number
  metadata?: {
    category?: string
    tags?: string[]
  }
}

// 模拟插件市场数据
const marketPlugins = ref<MarketPlugin[]>([
  {
    name: '图像处理',
    package_name: 'image-processing',
    description: '提供图像处理功能，支持图片编辑、滤镜、格式转换等',
    version: '1.0.0',
    author: '开发者',
    homepage: 'https://github.com/example/image-processing',
    license: 'MIT',
    downloads: 1200,
    rating: 4.5,
    metadata: {
      category: 'media',
      tags: ['image', 'processing']
    }
  },
  {
    name: '语音识别',
    package_name: 'speech-recognition',
    description: '集成多种语音识别引擎，支持实时语音转文字',
    version: '2.1.0',
    author: '开发者',
    homepage: 'https://github.com/example/speech-recognition',
    license: 'Apache-2.0',
    downloads: 800,
    rating: 4.2,
    metadata: {
      category: 'media',
      tags: ['speech', 'audio']
    }
  }
])

const searchQuery = ref('')

const handleInstall = async (plugin: MarketPlugin) => {
  try {
    const response = await fetch('/backend-api/api/plugin/plugins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        package_name: plugin.package_name
      })
    })
    
    if (response.ok) {
      alert('插件安装成功')
    }
  } catch (error) {
    console.error('安装插件失败:', error)
  }
}

const filteredPlugins = computed(() => {
  if (!searchQuery.value) return marketPlugins.value
  
  const query = searchQuery.value.toLowerCase()
  return marketPlugins.value.filter(plugin => 
    plugin.name.toLowerCase().includes(query) ||
    plugin.description.toLowerCase().includes(query) ||
    plugin.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
  )
})
</script>

<template>
  <div class="plugin-market">
    <n-space vertical :size="16">
      <n-card title="插件市场">
        <template #header-extra>
          <n-input
            v-model:value="searchQuery"
            placeholder="搜索插件..."
            style="width: 200px"
          >
            <template #prefix>
              <div class="i-carbon-search" />
            </template>
          </n-input>
        </template>
        
        <n-grid :cols="2" :x-gap="16" :y-gap="16">
          <n-grid-item v-for="plugin in filteredPlugins" :key="plugin.package_name">
            <n-card :title="plugin.name" size="small">
              <template #header-extra>
                <n-space>
                  <n-tag size="small">v{{ plugin.version }}</n-tag>
                  <n-tag size="small" type="success">{{ plugin.metadata?.category }}</n-tag>
                </n-space>
              </template>
              
              <n-space vertical size="small">
                <div class="plugin-description">{{ plugin.description }}</div>
                
                <div class="plugin-meta">
                  <n-space align="center" :size="12">
                    <span>作者: {{ plugin.author }}</span>
                    <span>|</span>
                    <span>下载: {{ plugin.downloads }}</span>
                    <span>|</span>
                    <span>评分: {{ plugin.rating }}/5</span>
                  </n-space>
                </div>
                
                <div class="plugin-tags">
                  <n-space>
                    <n-tag
                      v-for="tag in plugin.metadata?.tags"
                      :key="tag"
                      size="small"
                      type="info"
                    >
                      {{ tag }}
                    </n-tag>
                  </n-space>
                </div>
                
                <n-space justify="end">
                  <n-button
                    v-if="plugin.homepage"
                    text
                    tag="a"
                    :href="plugin.homepage"
                    target="_blank"
                  >
                    主页
                  </n-button>
                  <n-button type="primary" @click="handleInstall(plugin)">
                    安装
                  </n-button>
                </n-space>
              </n-space>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-card>
    </n-space>
  </div>
</template>

<style scoped>
.plugin-market {
  height: 100%;
}

.plugin-description {
  color: var(--n-text-color-2);
  font-size: 14px;
  line-height: 1.5;
}

.plugin-meta {
  font-size: 12px;
  color: var(--n-text-color-3);
}

.plugin-tags {
  margin-top: 8px;
}
</style> 