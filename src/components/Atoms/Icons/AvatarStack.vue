<template>
    <div class="isolate flex -space-x-2 overflow-hidden">
        <slot v-for="(imageUrl, index) in imageUrls" :key="imageUrl">
            <img class="relative inline-block h-8 w-8 rounded-full ring-2 ring-white" :class="zindex(index)" :src="imageUrl.src" :alt="imageUrl.alt" />
        </slot>
    </div>
</template>

<script setup>

const { imageUrls } = defineProps({
    imageUrls: {
        type: Array,
        default: () => [
            { src: 'https://pbs.twimg.com/profile_images/1244859550169206784/AWGcu5Hc_400x400.jpg', alt: 'Austin Kregel' },
            { src: 'https://pbs.twimg.com/profile_images/1244859550169206784/AWGcu5Hc_400x400.jpg', alt: 'Austin Kregel' },
            { src: 'https://pbs.twimg.com/profile_images/1244859550169206784/AWGcu5Hc_400x400.jpg', alt: 'Austin Kregel' },
        ],
    },
});
const zindex = (index) => {
    if (index === 0) return 'z-50';
    if (index === 1) return 'z-40';
    if (index === 2) return 'z-30';
    if (index === 3) return 'z-20';
    if (index === 4) return 'z-10';
    return 'z-0';
};
</script>

