<template>
    <a href="#" :class="[active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm']">License</a>
</template>
<script setup>
const { active } = defineProps({
    active: {
        type: Boolean,
        default: false,
    }
})
</script>