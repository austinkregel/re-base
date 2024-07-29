<template>
    <LeftThird></LeftThird>
    <RouterView />
</template>

<script setup>
import { RouterView } from "vue-router";
import LeftThird from "../components/LeftThird.vue";
</script>