<template>
    <div>
        <div class="mt-2 ml-2 px-2 w-full flex flex-col border-l border-neutral-800">
            <div class="flex items-center justify-between w-full">
                <button class="flex items-center gap-1flex-grow" @click="openProject" id="open">
                    <slot name="icon"></slot>

                    <span class="ml-2">{{ name }}</span>
                </button>

                <button @click="disconnectProject" id="disconnect">
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            <slot name="folders"></slot>
        </div>
    </div>
</template>

<script>
export default {
    props: ['name', 'client'],
    methods: {
        async disconnectProject() {
            await this.$store.dispatch('deleteProject', { id: this.client.txt.id, name: this.name })
        },
        openProject() {
          // this.$store.commit('setClient')
            this.$store.dispatch('openProject', {
                client: this.client,
                name: this.name,
                path: this.client.txt[this.name],
            })
        }
    },

}
</script>