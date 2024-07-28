<script setup>
import { defineProps } from 'vue';

const { bold, italic, underline } = defineProps({
    bold: {
        type: Boolean,
        default: false,
    },
    italic: {
        type: Boolean,
        default: false,
    },
    underline: {
        type: Boolean,
        default: false,
    },
    base: {
        type: false,
        default: true,
    },
    xs: {
        type: false,
        default: false,
    },
    small: {
        type: false,
        default: false,
    },
    medium: {
        type: false,
        default: false,
    },
    large: {
        type: false,
        default: false,
    },
    xl: {
        type: false,
        default: false,
    },
    xxl: {
        type: false,
        default: false,
    },
});

</script>

<template>
    <div :class="{
        'font-bold': bold,
        'italic': italic,
        'underline': underline,
        'text-base': base,
        'text-xs': xs,
        'text-sm': small,
        'text-md': medium,
        'text-lg': large,
        'text-xl': xl,
        'text-2xl': xxl,
    }">
        <slot></slot>
    </div>
</template>
