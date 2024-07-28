<template>
    <Avatar
        :xs="xs"
        :small="small"
        :medium="medium"
        :large="large"
        :xl="xl"
        :xxl="xxl"
        :image="image"
        :rounded="rounded"
    >
        <span class="absolute right-0 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-stone-900" :class="[color, position]" />
    </Avatar>
</template>

<script setup>
import { computed } from 'vue';
import Avatar from './Avatar.vue';

const { 
    xs,
    small,
    medium,
    large,
    xl,
    xxl,
    image,
    top,
    bottom,
    type,
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

    top: {
        type: Boolean,
        default: false,
    },
    bottom: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        default: 'danger',
    },
});

const position = computed(() => {
    if (top) return 'top-0';
    if (bottom) return 'bottom-0';
    return 'bottom-0';
});

const color = computed(() => {
    if (type === 'danger') return 'bg-red-500';
    if (type === 'warning') return 'bg-yellow-500';
    if (type === 'ifno') return 'bg-blue-500';
    return 'bg-green-500';
});

</script>
