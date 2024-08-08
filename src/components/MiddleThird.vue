<template>
  <div class="flex flex-wrap h-screen font-mono text-base">
    <div class="bg-neutral-900  h-full border-l-2 border-black flex flex-col" :style="collapsed ? 'width: 55px;':'width: 300px;'">
      <div id="tabs" class="flex w-full justify-between" :class="{ 'flex-wrap': !collapsed, 'flex-col': collapsed }">
        <div class="flex" :class="{ 'flex-wrap': !collapsed, 'flex-col': collapsed }">
          <button @click="tab = 'files'" :class="[tab === 'files' ? 'bg-neutral-800' : 'bg-neutral-900']" class="py-2 px-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
          </button>
          <button @click="tab = 'settings'" :class="[tab === 'settings' ? 'bg-neutral-800' : 'bg-neutral-900']" class="py-2 px-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </div>
        <button class="p-2 mx-2" @click="() => toggleCollapse()">
          <svg v-if="!collapsed" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          <svg v-else class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
      <div v-if="!collapsed && ! $store.getters.loadingFiles" class="p-2 bg-neutral-800 flex-grow max-h-screen overflow-y-scroll">
        <div v-if="tab === 'files'" class="w-full h-full">
          <FileExplorer class="h-full"/>
        </div>
        <div v-else-if="tab === 'settings'" class="space-y-4">
          <NodeSettings />
        </div>
      </div>
      <div v-else-if="$store.getters.loadingFiles && !collapsed" class="w-full h-full flex gap-2 items-center justify-center">
        <loading-ascii art="balloon" timeout="175"></loading-ascii>
        <span>Loading files</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import FileOrFolder from '../components/FileOrFolder.vue'
import FileExplorer from '../components/Editor/FileExplorer.vue';
import { ref } from 'vue';
import { useStore } from 'vuex';
import NodeSettings from '../components/Editor/NodeSettings.vue';

const collapsed = ref(getLocalStorage('middleThirdCollapsed', false));
const tab = ref('files');

const $store = useStore();

function toggleCollapse() {
  collapsed.value = !collapsed.value
  setLocalStorage('middleThirdCollapsed', this.collapsed)
}
function closeMenu() {
  $store.commit('setContextMenuFile', null);
}

</script>