<template>
    <div class="flex justify-center items-center h-screen w-full">
        <form class="bg-white dark:bg-stone-800 shadow-md rounded px-8 pt-6 pb-8 mb-4" @submit.prevent="submitForm">
            <div class="mb-4">
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" for="email">
                    Email
                </label>
                <input
                    v-model="email"
                    class="shadow appearance-none border rounded w-full dark:bg-stone-700 py-2 px-3 text-gray-700 dark:text-gray-200 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                />
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" for="password">
                    Password
                </label>
                <input
                    v-model="password"
                    class="shadow appearance-none border rounded w-full dark:bg-stone-700 py-2 px-3 text-gray-700 dark:text-gray-200 dark:border-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                />
            </div>
            <div class="flex items-center justify-between">
                <button
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                >
                    Sign In
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { invoke } from '@tauri-apps/api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('admin');

const submitForm = async () => {
    try {
        const response = await invoke('login', { email: email.value, password: password.value });
        localStorage.setItem('accessToken', response.token);

        location.replace('/-');
    } catch (error) {
        console.error(error);
    }
};
</script>

<style>
/* Add Tailwind CSS classes here if needed */
</style>