<template>
    <div class="w-full">
        <div class="flex flex-wrap rounded-lg gap-4">
            <div v-if="title" class="text-4xl mb-4 font-medium text-stone-900 dark:text-stone-200">
                {{ title }}
            </div>

            <SporkButton @click="openCreateModal">
                Create New {{ singular }}
            </SporkButton>
            <SporkTable :headers="[]" :data="data">
                <template #table-top>
                    <div class="relative z-0 w-full flex flex-wrap justify-between items-center ">
                        <div class="flex gap-4 items-center">
                            <input
                                type="checkbox"
                                class="h-4 w-4 cursor-pointer focus:ring-stone-500 border-gray-400 dark:bg-stone-200 dark:border-stone-700 rounded checked:bg-red-500 hover:bg-red-600 active:bg-indigo-500 active:checked:bg-indigo-600 hover:checked:active:bg-orange-400 hover:checked:bg-blue-300"
                                :value="data.length > 0 && selectedItems.length === data.length"
                                @click="selectAll"
                            />


                            <span v-if="selectedItems.length > 0" class="text-sm text-stone-700 dark:text-stone-300">{{ selectedItems.length }} selected</span>
                        </div>

                        <div class="flex items-center gap-4">
                            <div class="flex flex-wrap items-center dark:bg-stone-900 dark:text-slate-100 rounded" v-if="description?.actions?.length > 0 && selectedItems.length > 0">
                                <select v-model="actionToRun" class="border border-stone-300 rounded-lg flex-grow py-1 dark:border-stone-900 dark:bg-stone-900 dark:text-slate-100">
                                    <option v-for="action in description?.actions ??[]" :key="action" :value="action">{{ action.name }} ({{ selectedItems.length }})</option>
                                </select>

                                <button type="button" @click.prevent="executeActionOrOpenDialog">
                                    <PlayIcon v-if="!executing || !applyTagModalOpen" class="w-6 h-6 stroke-current mr-2 text-green-400" />
                                    <ArrowPathIcon v-else class="w-6 h-6 stroke-current mr-2 text-blue-400" />
                                </button>
                            </div>

                            <div v-if="description.permissions.delete">
                                <button @click="$emit('destroyMany', selectedItems)">
                                    <DynamicIcon icon-name="TrashIcon" class="w-6 h-6 stroke-current text-red-500" />
                                </button>
                            </div>

                            <button @click="filtersOpen= !filtersOpen" class="focus:outline-none flex flex-wrap items-center p-2 rounded-lg" :class="{'bg-stone-300 dark:bg-stone-700': filtersOpen, 'bg-stone-100 dark:bg-stone-900': !filtersOpen}">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>

                            <div v-if="filtersOpen" class="absolute z-10 bg-white dark:bg-stone-700 shadow-lg top-0 right-0 mt-14 mr-4 border border-stone-200 dark:border-stone-500 rounded-lg" style="width: 250px;">
                                <div class="bg-stone-100 dark:bg-stone-800 uppercase py-2 px-2 font-bold text-stone-500 dark:text-stone-400 text-sm rounded-t-lg">
                                    filters
                                </div>
                                <div class="flex flex-wrap items-center p-2">
                                    <select @change="(e) => router.reload({
                                        search: {limit: 321}
                                    })" class="border border-stone-300 rounded-lg w-full p-1 dark:border-stone-600 dark:bg-stone-600">
                                        <option value="15">15 items per page</option>
                                        <option value="30">30 items per page</option>
                                        <option value="100">100 items per page</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <template #datum="{ datum }">
                    <div class="flex items-center w-full">
                        <div class="w-6 mx-4">
                            <input
                                type="checkbox"
                                class="h-3 w-3 cursor-pointer focus:ring-stone-500 border-gray-400 dark:bg-stone-200 dark:border-stone-700 rounded checked:bg-red-500 hover:bg-red-600 active:bg-indigo-500 active:checked:bg-indigo-600 hover:checked:active:bg-orange-400 hover:checked:bg-blue-300"
                                v-model="selectedItems"
                                :value="datum"
                            />
                        </div>
                        <div class="flex-1 dark:text-stone-50 text-black">
                            <slot v-if="datum" class="flex-1" :data="datum" name="data" :open-modal="() => createOpen = true"></slot>
                        </div>
                        <div v-if="description.permissions.destroy" class="flex items-center w-8">
                            <button type="button" @click.prevent="$emit('destroy', datum)">
                                <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>
                </template>

                <template #no-data>
                    <div>
                        No data present in table
                    </div>
                </template>

                <template #table-bottom>
                    <div class="w-full dark:text-white flex justify-between flex-wrap bg-stone-100 dark:bg-stone-800 px-4 py-2">
                        <Link :href="paginator.prev_page_url" :disabled="hasPreviousPage" :plain="true" :xlarge="true" :class="[!hasPreviousPage ? 'opacity-50 cursor-not-allowed': '']">Previous</Link>
                        <div class="py-2">
                            {{ (currentPage * itemsPerPage) - itemsPerPage }} total items, {{ currentPage  }} of {{ paginator?.total}}
                        </div>
                        <Link
                            :href="paginator.next_page_url"
                         :disabled="hasNextPage"
                         :class="[!hasNextPage ? 'opacity-50 cursor-not-allowed': 'cursor-pointer']"
                        >Next</Link>
                    </div>
                </template>
            </SporkTable>
        </div>
    </div>

    <Modal :show="createOpen" @close="close">
        <div class="text-xl flex justify-between p-4">
            <slot name="modal-title">Create Modal</slot>
            <button @click="close" class="focus:outline-none">
                <DynamicIcon icon-name="XMarkIcon" class="w-6 h-6 stroke-current" />
            </button>
        </div>
        <div class="flex flex-col border-t border-stone-200 dark:border-stone-600 mt-2 p-4">
            <slot name="form" :open-modal="() => createOpen = true"></slot>
            <div class="mt-4 flex justify-end gap-4">
                <SporkButton @click.prevent="async () => {
                                createOpen = false;
                            }"
                             primary
                             medium
                >
                    Close
                </SporkButton>
                <SporkButton @click.prevent="async () => {
                                $emit('save', form, () => createOpen = !createOpen);
                             }"
                             primary
                             medium
                >
                    Save
                </SporkButton>
            </div>
        </div>
    </Modal>

    <ApplyTagModal
        :show="applyTagModalOpen && actionToRun && actionToRun.slug === 'apply-tag'"
        :type="description.model"
        @close="() => applyTagModalOpen = false"
        :identifiers="selectedItems.map((item) => item.id)"
        :name="description.name"
    >
    </ApplyTagModal>

    <Modal :show="executing && actionToRun && actionToRun.fields && actionToRun.slug !== 'apply-tag'">
        <div class="text-xl flex flex-col justify-between p-4">
            <div v-for="(field, fieldName) in actionToRun.fields">
                <div>
                    {{ fieldName }}
                </div>
                <SporkDynamicInput
                    v-model="form[fieldName]"
                    :type="field.type"
                    :autofocus="field?.autofocus ?? false"
                    :disabled-input="field?.disabled ?? false"
                    :editable-label="field?.editableLabel ?? false"
                    :error="hasErrors(fieldName)"
                    :options="field?.options ?? []"
                >
                </SporkDynamicInput>
            </div>

            <div class="mt-4">
                <SporkButton xsmall plain>
                    Apply
                </SporkButton>
            </div>
        </div>
    </Modal>
</template>

<script setup>
import {ref, computed, watch} from 'vue';
import { PlayIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";
import SporkButton from './SporkButton.vue';
import { router, Link } from '@inertiajs/vue3';
import SporkTable from "@/Components/Spork/SporkTable.vue";
import Modal from "@/Components/Modal.vue";
import SporkDynamicInput from "@/Components/Spork/SporkDynamicInput.vue";
import Button from "@/Components/Button.vue";
import DynamicIcon from "@/Components/DynamicIcon.vue";
import ApplyTagModal from "@/Components/Spork/Molecules/ApplyTagModal.vue";
import SporkInput from "@/Components/Spork/SporkInput.vue";
const {
  form,
  title,
  singular,
  save,
  upload,
  data,
  paginator,
  settings,
  description,
    apiLink,
} = defineProps({
  form: {
    type: Object,
    default: null,
  },
  title: {
    type: String,
    default: '',
  },
  singular: {
    type: String,
    default: 'singular',
  },
  // getters
  data: {
    type: Array,
    default: () => [],
  },
  paginator: {
    type: Object,
    default: () => ({}),
  },
  settings: {
    type: Object,
    default: () => ({})
  },
  description: {
    default :  () => ({
        actions: [],
          query_actions: [],
          fillable: [],
          fields: [],
          required: [],
          sorts: [],
        tags: [],
    })
  },
    plural: {
        type: String,
        default: ''
    },
    apiLink: {
        type: String,
        default: '/api/crud/models'
    }
})
const $emit = defineEmits([
    'index',
    'destroy',
    'save',
    'execute',
    'destroyMany',
])

const createOpen = ref(false);
const filtersOpen = ref(false);
const selectedItems = ref([]);
const itemsPerPage = ref(15);
const actionToRun = ref(null);
const searchQuery = ref(localStorage.getItem('searchQuery') ? localStorage.getItem('searchQuery') : '');
const debounceSearch = ref(null);
const executing = ref(false);

const selectedTagToApply = ref(null);
const openCreateModal = () => {
    $emit('clearForm');
    createOpen.value = true;
}
watch(
    () => actionToRun.value,
    (newVal) => {
        if (newVal?.fields) {
            form.value = {};
            Object.keys(newVal.fields).forEach((field) => {
                form[field] = '';
            })

            applyTagModalOpen.value = newVal.slug === 'apply-tag';
        }
    }
)
const hasPreviousPage = computed(() => {
  return paginator.prev_page_url !== null;
});

const hasNextPage = computed(() => {
  return paginator.next_page_url !== null;
});
const total = computed(() => {
  return paginator.total;
})
const currentPage = computed(() => {
  return paginator.current_page;
});
const lastPage = computed(() => {
  return Math.max(paginator.total / paginator.per_page, 1);
});


const hasErrors = (error) => {
  if (!form.errors) {
    return '';
  }

  return form.errors[error];
};
const selectAll = (event) => {
  if (event.target.checked) {
    selectedItems.value = data;
  } else {
    selectedItems.value = [];
  }
}
const clearSearch = () => {
  searchQuery.value = '';
}
const close = () => {
  createOpen.value = false;
}
const executeActionOrOpenDialog = async () => {
    if (actionToRun.value.slug === 'apply-tag') {
        applyTagModalOpen.value = true;
        return;
    }
    executing.value = true;

  // await $emit('execute', {
  //     selectedItems,
  //     actionToRun,
  //     next: () => {
  //         selectedItems.value = [];
  //         executing.value = false;
  //     }
  // })
}

const applyTagModalOpen = ref(false);
const applyTag = async () => {
    if (!selectedTagToApply.value) {
        return;
    }

    await Promise.all(selectedItems.value.map(async (item) => {
        await axios.post(`${apiLink}/${item.id}/tags`, {
            tags: [selectedTagToApply.value]
        })
    }))

    router.reload({
        only: ['data', 'paginator', 'description']
    })
}
// const searchQuery = (newVal, oldVal) => {
//     if (debounceSearch !== null) {
//         clearTimeout(this.debounceSearch)
//     }
//     debounceSearch.value = setTimeout(() => {
//         localStorage.setItem('searchQuery', newVal);
//         this.$emit('index', {
//             page: 1,
//             limit: 15,
//             filter: {
//                 q: newVal
//             }
//         });
//
//     }, 400);
// }
</script>
