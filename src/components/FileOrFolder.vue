<template>
  <div>
    <div class="pl-2 flex flex-col w-full"
         :class="[
                    $store.getters.settings.sourceDirectory.includes(name) ? 'bg-blue-500/10' :'',
                    $store.getters.settings.blacklistDirectory.includes(name) ? 'bg-stone-700/10' :'',
                    $store.getters.settings.vendorDirectory.includes(name) ? 'bg-orange-500/10' :'',
                    $store.getters.settings.projectPaths.includes(file.file_path) ? 'bg-amber-600/10 dark:bg-amber-400/10' :'',
            ]"
    >
      <button
          v-if="folder"
          class="flex gap-1 items-center dark:hover:bg-zinc-900/50 focus:bg-zinc-900/50 focus:ring-2 focus:ring-blue-800 text-slate-700 dark:text-slate-200"
          :class="[
                    $store.getters.settings.testDirectory.includes(name) ? 'text-green-600 dark:text-green-400' :'',
                    $store.getters.settings.sourceDirectory.includes(name) ? 'text-blue-500 dark:text-blue-300' :'',
                    $store.getters.settings.blacklistDirectory.includes(name) ? 'text-stone-600 dark:text-stone-400' :'',
                    $store.getters.settings.vendorDirectory.includes(name) ? 'text-orange-600 dark:text-orange-400' :'',
                    // Projects in an existing file root.
                    $store.getters.settings.projectPaths.includes(file.file_path) ? 'text-amber-600 dark:text-amber-400' :'',
                ]"
          @dblclick="onToggleFolderExpand"
      >
        <svg v-if="!open" class="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
        <svg v-else class="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>

        <svg slot="icon" class="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <path v-if="open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
        </svg>

        <span class="tracking-tight">{{ name }}</span>
      </button>
      <button v-else class="flex gap-1 items-center dark:hover:bg-zinc-900/50 focus:bg-zinc-900/50  focus:ring-2 focus:ring-blue-800"
              :class="[
                file.executable ? 'text-green-600 dark:text-green-400' :'',
                $store.getters.settings.packageVersionControl.includes(name) ? 'text-blue-500 dark:text-blue-300' :'',
                $store.getters.settings.packageVersionControlLockFiles.includes(name) ? 'text-orange-600 dark:text-orange-400' :'',
                ![
                    ...$store.getters.settings.packageVersionControl,
                    ...$store.getters.settings.packageVersionControlLockFiles,
                ].includes(name) && !file.executable ? 'text-slate-700 dark:text-slate-100' :'',
            ]"
              @dblclick="() => openFile(fileThing)">
        <div class="w-4 h-4 flex-none"></div>

        <svg class="w-4 h-4 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span class="tracking-tight">{{ name }}</span>
      </button>
      <div v-if="folder && open">
        <file-or-folder v-for="fileThing in files" :key="fileThing.absolute" :file="fileThing">
          <svg slot="icon" class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg">
            <path v-if="fileThing.is_directory" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </file-or-folder>
      </div>
    </div>
  </div>
</template>

<script>
import { invoke } from '@tauri-apps/api';

export default {
  props: ['file'],
  data: () => ({
    open: false,
    collapsed: true,
    files: [],
  }),
  computed: {
    name() {
      return this.file.name;
    },
    folder() {
      return this.file.is_directory;
    },
  },
  methods: {
    async onToggleFolderExpand() {
      if (this.open) {
        this.open = false;
        return;
      }

      const files = JSON.parse(await invoke('async_fetch_path', this.file));

      this.open = true;
      this.files = files;
    },
    openFile() {
      console.log('openFile', this.file);
      this.$store.dispatch('openFile', this.file);
    },
  }
}
</script>
