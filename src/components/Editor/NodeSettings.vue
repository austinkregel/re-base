<template>
<div>
    <label class="flex flex-wrap items-center gap-2 -ml-4">
        <input type="checkbox" v-model="form.use_git">
        <span class="ml-4">Git init new developments</span>
    </label>
    </div>

    <hr class="border-t border-neutral-500">

    <div class="flex flex-col gap-2">
    <div class="text-red-500 uppercase my-2 font-bold tracking-wide">Danger Zone</div>
    <button
        v-if="$store.getters.openProject?.settings?.template"
        class="bg-red-500 text-white px-1 rounded-lg border-2 border-red-500"
        @click="redeploy"
    >Redeploy Development</button>
    <button
        class="bg-red-500 text-white px-1 rounded-lg border-2 border-red-500"
        @click="destroy"
    >Delete {{$store.getters.openProject?.name }}, and files</button>
    <button
        class="bg-red-500 text-white px-1 rounded-lg border-2 border-red-500"
        @click="destroy"
    >Delete {{$store.getters.openProject?.name }}, keep files</button>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';

const $store = useStore();
const form = ref({
    use_git: false
})

async function destroy () {
  if (!confirm('Are you sure you want to delete this project? This action is perminent.')) {
    return;
  }

  await $store.dispatch('destroyProject')
}

async function redeploy () {
  if (!confirm('Are you sure you want to redeploy? This action is perminent.')) {
    return;
  }

  await $store.dispatch('redeploy')
}
</script>