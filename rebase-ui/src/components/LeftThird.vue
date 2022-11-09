<template>
    <div class="bg-neutral-700 h-full flex flex-col justify-between" :style="collapsed ? 'min-width: 40px;':'min-width: 300px;'">
        <div class="flex justify-between w-full bg-neutral-800">
            <div v-if="!collapsed" class="flex items-center text-white">
                <svg class="w-8 h-8 ml-4 mr-2 my-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="mt-1 text-xl">Re:base</span>
            </div>

            <button class="p-2 ml-2 mr-1" @click="() => toggleCollapse()">
                <svg v-if="!collapsed" class="w-4 h-4 text-white stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <svg v-else class="w-4 h-4 text-white stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        </div>
        <div class="items-start flex-grow text-sm text-white">
            <div class="mt-3 px-2 font-bold flex items-center justify-between ">
                <span>VMS</span>

                <button v-if="!collapsed">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </button>
            </div>
            <hr class="my-2 border-neutral-800"/>
            <div v-for="client in clients" :key="client.fullname">
                <div class="px-2 pt-2 flex" :class="collapsed ? 'justify-center' : 'justify-between'">
                    <div class="flex items-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                             xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                        </svg>

                        <div v-if="!collapsed" class="ml-2 text-gray-300">
                            {{ client.name }}
                        </div>
                    </div>
                    <button v-if="!collapsed" @click="() => openNewProjectDialog(client)">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </button>
                </div>

                <div class="ml-2">
                    <project-link v-for="txt in getProjects(client)" v-if="!collapsed" :key="txt.name" :name="txt.name" :client="client">
                        <svg slot="icon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    </project-link>
                </div>
            </div>
        </div>
        <div class="bg-neutral-800 flex justify-between">
            <div class="p-2 flex flex-wrap w-full items-center">
                <img src="https://pbs.twimg.com/profile_images/1244859550169206784/AWGcu5Hc_400x400.jpg" alt=""
                     class="w-6 h-6 rounded">
                <span class="ml-2" v-if="!collapsed">
                    Austin Kregel
                </span>
            </div>
            <div class="p-2 flex items-center" v-if="!collapsed">
                <svg class="w-6 h-6 stroke-current text-white" viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
                <svg class="w-6 h-6 ml-4 stroke-current text-white"  viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
import FileOrFolder from "./ProjectLink.vue";
import ProjectLink from "./ProjectLink.vue";

export default {
    components: { ProjectLink, FileOrFolder },
    data() {
        return {
            collapsed: getLocalStorage('leftThirdCollapsed', false),
        }
    },
    methods: {
        toggleCollapse() {
            this.collapsed = !this.collapsed;
            setLocalStorage('leftThirdCollapsed', this.collapsed);
        },
        getProjects(client) {
            return Object.keys(client.txt)
                .filter(i => i !== 'id')
                .map(key => ({
                    name: key,
                    path: client.txt[key]
                }))
        },
        openNewProjectDialog(client) {
            Swal.mixin({
                input: 'text',
                confirmButtonText: 'Next &rarr;',
                showCancelButton: true,
                progressSteps: ['1', '2']
            }).queue([
                {
                    title: 'What is the new project name?',
                    text: 'This is just the name we\'ll call it here.'
                },
                {
                    title: 'What is the file path to that project?',
                    text: 'This file path should be absolute, and located on the client.'
                },
            ]).then((result) => {
                if (!result.value) {
                    console.error('Short circuit!', result);
                    return;
                }

                const [name, path] = result.value;

                this.$store.dispatch('createProject', {
                    name,
                    path,
                    client: client.txt.id,
                })
            })

        },
        openProject(client, project) {
            console.log(client, project)
        }
    },
    computed: {
        clients() {
            return this.$store.getters.clients;
        }
    }
}
</script>
