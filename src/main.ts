import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')


const oldFetch = window.fetch
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {    
    if(localStorage.getItem('token')) {
        if(init == undefined) {
            init = {}
        }
        if(init['headers'] == undefined) {
            init['headers'] = {}
        }
        init['headers']['Authorization'] = `Bearer ${localStorage.getItem('token')}`
    }

    let response = await oldFetch(input, init)
    if(router?.currentRoute?.value?.name != 'login') {
        if(response.status == 401) {
            router.push('/login')
        }
    }
    
    return response
}