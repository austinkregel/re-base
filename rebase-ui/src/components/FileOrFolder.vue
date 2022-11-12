<template>
    <div>
        <div class="pl-2 flex flex-col w-full border-l border-neutral-800">
            <button v-if="folder" class="flex items-center focus:outline-none" @dblclick="onToggleFolderExpand">
                <svg v-if="!open" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>

                <svg slot="icon" class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path v-if="open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>

                <span class="ml-2">{{ name }}</span>
            </button>
            <button v-else class="flex items-center focus:outline-none" @dblclick="openFile">
                <div class="w-4 h-4"></div>

                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>

                <span class="ml-2">{{ name }}</span>
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

export default {
    name: "FileOrFolder",
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
        onToggleFolderExpand() {
            if (this.open) {
                this.open = false;
                return;
            }
            axios.post('/api/files/' + this.$store.getters.selectedClient.txt.id, {
                path: this.file.file_path
            })
                .then(({ data }) => {
                    this.files = data;
                    this.open = true;
                })
        },
        openFile() {
          console.log(this.$store.getters)
            this.$store.dispatch('openFile', {
                id: this.$store.getters.selectedClient.id,
                path: this.file.file_path,
                file: this.file,
            });
        },
    }
}
</script>

<style scoped>

</style>