<script setup>

// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import LeftThird from "./routes/LeftThird.vue";
import MiddleThird from "./routes/MiddleThird.vue";
import RightThird from "./routes/RightThird.vue";
</script>

<template>
  <div class="flex max-h-screen w-full bg-neutral-900 h-full text-gray-900 dark:text-white">
    <left-third></left-third>
    <middle-third></middle-third>
    <right-third></right-third>
  </div>
</template>

<style>

</style>
