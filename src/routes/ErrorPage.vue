<template>
    <div class="flex flex-col items-center justify-center h-screen bg-pink-200">
        <h1 class="text-6xl font-bold text-pink-800">404</h1>
        <p class="text-xl text-pink-800">Oops! Page not found.</p>
        <router-link to="/" class="mt-8 px-4 py-2 text-white bg-pink-800 rounded hover:bg-pink-900">Go back to Home</router-link>
    </div>
</template>

<script>
export default {
    name: 'ErrorPage',
};
</script>

<style>
/* Add any custom styles here */
</style>
