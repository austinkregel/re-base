<template>
    <span class="relative inline-block">
        <img v-if="image" :src="image ?? ''" :class="[size, rounded ? 'rounded-full' : 'rounded-lg']"/>
        <slot />
    </span>
</template>

<script setup>
import { computed } from 'vue';

const { 
    xs,
    small,
    medium,
    large,
    xl,
    xxl,
    image,
 } = defineProps({
    xs: {
        type: Boolean,
        default: false,
    },
    small: {
        type: Boolean,
        default: false,
    },
    medium: {
        type: Boolean,
        default: false,
    },
    large: {
        type: Boolean,
        default: false,
    },
    xl: {
        type: Boolean,
        default: false,
    },
    xxl: {
        type: Boolean,
        default: false,
    },
    image: {
        default: null,
    },
    rounded: {
        type: Boolean,
        default: true,
    },
});

const size = computed(() => {
    if (xs) return 'w-6 h-6';
    if (small) return 'w-8 h-8';
    if (medium) return 'w-10 h-10';
    if (large) return 'w-12 h-12';
    if (xl) return 'w-16 h-16';
    if (xxl) return 'w-20 h-20';
    return 'w-6 h-6';
});
</script>
