<template>
    <div class="login-page">
        <form class="login-form" @submit.prevent="submitForm">
            <h1 class="login-title">ChatGPT for Bot 控制台</h1>
            <div class="form-group">
                <label for="password" class="sr-only">Password</label>
                <input type="password" id="password" v-model="password" placeholder="Password" required
                    @change="clearErrorMessage" />

            </div>
            <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>

            <button type="submit" class="submit-btn" :disabled="isLoading">
                <span v-if="isLoading">Loading...</span>
                <span v-else>Submit</span>
            </button>
        </form>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const $router = useRouter()
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

function clearErrorMessage() {
    errorMessage.value = ''
}

const submitForm = async () => {
    isLoading.value = true;
    errorMessage.value = '';
    const resp = await fetch('/backend-api/v1/login', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            'password': password.value
        })
    })
    const body = await resp.json()
    isLoading.value = false;
    if (resp.status != 200) {
        errorMessage.value = body['error']
    } else {
        localStorage.setItem('token', body['token'])
        $router.push('/dashboard')
    }
};
</script>
  
<style>
.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: white;
    background-image: -webkit-gradient(linear, 0 0, 0 100%, color-stop(.5, transparent), color-stop(.5, rgba(226, 205, 188, .9)), to(rgba(226, 205, 188, .9))),
        -webkit-gradient(linear, 0 0, 100% 0, color-stop(.5, transparent), color-stop(.5, rgba(226, 205, 188, .9)), to(rgba(226, 205, 188, .9)));
    background-image: -moz-linear-gradient(transparent 50%, rgba(226, 205, 188, .9) 50%, rgba(226, 205, 188, .9)),
        -moz-linear-gradient(0deg, transparent 50%, rgba(226, 205, 188, .9) 50%, rgba(226, 205, 188, .9));
    background-image: -o-linear-gradient(transparent 50%, rgba(226, 205, 188, .9) 50%, rgba(226, 205, 188, .9)),
        -o-linear-gradient(0deg, transparent 50%, rgba(226, 205, 188, .9) 50%, rgba(226, 205, 188, .9));
    background-image: linear-gradient(transparent 50%, rgba(226, 205, 188, .9) 50%, rgba(226, 205, 188, .9)),
        linear-gradient(0deg, transparent 50%, rgba(226, 205, 188, .9) 50%, rgba(226, 205, 188, .9));
}

.login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    transition: all 0.3s ease-in-out;
    min-width: 400px;
}

.login-title {
    margin-bottom: 1rem;
    font-size: 2rem;
    font-weight: bold;
    color: #333;
}

.form-group {
    width: 100%;
    margin-bottom: 1rem;
}

label {
    display: none;
}

input[type='password'] {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 5px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    font-size: 1rem;
    color: #333;
    background-color: #f9f9f9;
}

.submit-btn {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 5px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    font-size: 1rem;
    font-weight: bold;
    color: #fff;
    background-color: #333;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.submit-btn:hover {
    background-color: #555;
}

.error-message {
    margin: 1rem;
    font-size: 1rem;
    font-weight: bold;
    color: #ff0000;
    animation: shake 0.3s ease-in-out;
}


@keyframes shake {
    0% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
    }

    50% {
        transform: translateX(5px);
    }

    75% {
        transform: translateX(-5px);
    }

    100% {
        transform: translateX(0);
    }
}
</style>