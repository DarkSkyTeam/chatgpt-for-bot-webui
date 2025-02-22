import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { useAppStore } from '@/stores/app'
import { http } from '@/utils/http'
import { version } from '@/utils/version'

export interface UpdateResponse {
    current_backend_version: string
    latest_backend_version: string
    backend_update_available: boolean
    backend_download_url: string | null
    latest_webui_version: string
    webui_download_url: string | null
}

export interface UpdateInfo {
    current_backend_version: string
    latest_backend_version: string
    current_webui_version: string
    latest_webui_version: string
    backend_update_available: boolean
    webui_update_available: boolean
    backend_download_url: string | null
    webui_download_url: string | null
}

export interface UpdateProgress {
    step: string
    percentage: number
}

export function useUpdateViewModel() {
    const appStore = useAppStore()
    const message = useMessage()

    const showUpdateModal = ref(false)
    const updateInProgress = ref(false)
    const updateProgress = ref<UpdateProgress>({
        step: '',
        percentage: 0
    })

    // 处理错误信息
    const handleError = (error: any, defaultMessage: string) => {
        console.error(defaultMessage + ':', error)
        if (error.response?.data?.message) {
            message.error(error.response.data.message)
        } else if (error instanceof Error) {
            message.error(error.message)
        } else {
            message.error(defaultMessage)
        }
    }

    // 检查更新
    const checkUpdate = async () => {
        try {
            const data = await http.get<UpdateResponse>('/system/check-update')

            // 获取当前前端版本
            const current_webui_version = version.getCurrentVersion()

            // 判断前端是否需要更新
            const webui_update_available = version.compare(data.latest_webui_version, current_webui_version) > 0

            const updateInfo: UpdateInfo = {
                ...data,
                current_webui_version,
                webui_update_available
            }

            if (updateInfo.backend_update_available || updateInfo.webui_update_available) {
                showUpdateModal.value = appStore.setUpdateInfo(updateInfo)
            }
        } catch (error: any) {
            handleError(error, '检查更新失败')
        }
    }

    // 开始更新
    const startUpdate = async () => {
        updateInProgress.value = true
        updateProgress.value = { step: '准备更新...', percentage: 0 }

        try {
            // 开始更新
            updateProgress.value = { step: '下载更新包...', percentage: 30 }

            await http.post('/system/update', {
                update_backend: appStore.updateInfo?.backend_update_available ?? false,
                update_webui: appStore.updateInfo?.webui_update_available ?? false,
                backend_download_url: appStore.updateInfo?.backend_download_url,
                webui_download_url: appStore.updateInfo?.webui_download_url
            })

            updateProgress.value = { step: '安装更新...', percentage: 70 }

            // 重启系统
            updateProgress.value = { step: '重启系统...', percentage: 90 }

            try {
                await http.post('/system/restart')
                throw new Error('重启系统失败')
            } catch (error: any) {
                // 这个请求不可能成功
                updateProgress.value = { step: '更新完成，等待系统启动...', percentage: 100 }

                // 5秒后刷新页面
                setTimeout(() => {
                    window.location.reload()
                }, 5000)
            }



        } catch (error: any) {
            handleError(error, '更新失败')
            updateInProgress.value = false
        }
    }

    // 稍后提醒
    const remindLater = () => {
        showUpdateModal.value = false
        appStore.setUpdateRemindLater()
    }

    // 跳过此版本
    const skipVersion = () => {
        showUpdateModal.value = false
        appStore.setSkipVersion()
    }

    return {
        showUpdateModal,
        updateInProgress,
        updateProgress,
        checkUpdate,
        startUpdate,
        remindLater,
        skipVersion
    }
}