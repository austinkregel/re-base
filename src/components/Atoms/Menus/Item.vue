<template>
    <button @click.prevent="$emit('click')" 
    :class="[active ? 'bg-gray-100 text-gray-900 dark:text-gray-50 dark:bg-gray-600' : 'text-gray-700 dark:text-neutral-200 bg-neutral-700', 'block px-4 py-2 text-sm text-left']">
        <slot />
    </button>
</template>
<script setup>
const { active } = defineProps({
    active: {
        type: Boolean,
        default: false,
    }
})

const $emit = defineEmits(['click']);
</script>