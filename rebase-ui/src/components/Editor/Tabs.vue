<template>
  <div class="flex items-center border-b border-neutral-700 max-w-full overflow-hidden">
      <button
        v-for="file in $store.getters.openFiles"
        :key="file.absolute"
        class="py-3 px-2 flex items-center text-sm z-0"
        :class="[$store.getters.tab?.absolute === file.absolute ? 'bg-neutral-700 active' : 'bg-neutral-900']"
        @click="$store.commit('setOpen', { tab: file.absolute })"
        @click.middle="() => $store.commit('closeFile', file)"
    >
      <div v-if="file.data !== file.originalData" class="text-green-500 mr-1 font-bold z-10">•</div>
        <span class="z-10">{{ tabName(file) }}</span>
        <button class="ml-1 z-10" @click.prevent="() => $store.commit('closeFile', file)">
          <svg class="w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
    </button>
  </div>
</template>

<script>
export default {
  name: "Tab",
  methods: {
    possibleName(name) {

    },
    tabName(file) {
      const parts = file.file_path.split('/');

      const possibleName = parts[parts.length - 1];

      if (this.tabNames.includes(possibleName)) {
        return parts[parts.length - 2] + '/'+possibleName;
      }

      return possibleName;
    }
  },
  computed: {
    tabNames() {
      return Object.values(this.$store.getters.openFiles)
          .filter(file => file.absolute == this.$store.getters.tab?.absolute)
          .map(file => {
        const name = file.file_path.split('/');

        return name[name.length - 1];
      })
    }
  }
}
</script>

<style scoped>

</style>