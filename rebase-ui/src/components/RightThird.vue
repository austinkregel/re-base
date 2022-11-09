<template>
    <div v-if="hasOpenFiles" class="bg-neutral-900 h-full flex-1 flex flex-col justify-between border-l-2 border-black">
        <div class="flex items-center">
            <div v-for="file in openFiles" class="bg-neutral-800 p-2 flex items-center">
                <div v-if="file.dirty" class="text-green-500 mx-2 font-bold">•</div>
                {{file.name}}
                <button class="ml-2" @click.prevent="closeFile(file.id)">
                    <svg class="w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24"
                         xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        </div>
        <editor
            class="flex-grow"
            ref="editor"
            :content="content"
            :options="{
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: true,
                tabSize: 4
            }"
            :fontSize='14'
            :lang="'javascript'"
            :theme="'tomorrow_night_eighties'"

            @onChange="editorChange"
            @init="editorInit"></editor>

    </div>
    <div v-else class="bg-neutral-900 h-full flex-1 flex flex-col justify-between border-l-2 border-black"></div>
</template>

<script>
import { VAceEditor } from 'vue3-ace-editor';

export default {
    components: {
        Editor:VAceEditor
    },
    data: () => ({
        content: '',
    }),
    computed: {
        hasOpenFiles() {
            return Object.keys(this.$store.getters.openFiles).length > 0;
        },
        openFiles() {
            return this.$store.getters.openFiles;
        },
        activeFile: {
            get () {
                return this.$store.state.obj.message
            },
            set ({ value }) {
                this.$store.commit('updateFile', {
                    value,
                    file: ''
                })
            }
        }

    },
    methods: {
        editorChange(obj) {
            this.content = obj.value;
        },
        editorInit() {},
        closeFile(fileId) {
            this.$store.commit('closeFile', {absolute: fileId})
        }
    },
    mounted() {
        Bus.$on('fileChanged', (file) => {
            this.content = this.openFiles[file.absolute].data;
        });
    }
}
</script>

<style scoped>

</style>