<template>
    <ContextMenu>
        <file-or-folder
              v-for="file in $store.getters.files"
              :key="file.absolute"
              :file="file"
              @contextmenu="($event) => $store.commit('setContextMenuFile', file)"
        ></file-or-folder>
        <template #items>
            <div class="flex flex-col">
                <button class="hover:bg-neutral-500 text-left px-4 py-2" @click="createDirectory">New Directory</button>
                <button class="hover:bg-neutral-500 text-left px-4 py-2" @click="createFile">New File</button>
                <button class="hover:bg-neutral-500 text-left px-4 py-2" @click="destroy">Delete</button>
                <button class="hover:bg-neutral-500 text-left px-4 py-2" @click="addToProjects">Add to projects</button>
            </div>
        </template>
    </ContextMenu>
</template>

<script setup>
import ContextMenu from '../../ContextMenus/ContextMenu.vue';
import FileOrFolder from '../FileOrFolder.vue';
import { useStore } from 'vuex';

const $store = useStore();

async function createDirectory() {
  const name = prompt('Enter a name for the new directory');

  if (name) {
    await $store.dispatch('createDirectory', {
      name
    })
  }
  closeMenu()

};
async function createFile() {
  const name = prompt('Enter a name for the new file');

  if (name) {
    await $store.dispatch('createFile', {
      name
    })
  }
  closeMenu()
};
async function destroy() {
  if (!confirm('Are you sure you want to delete this project? This action is perminent.')) {
    return;
  }
  await $store.dispatch('destroyFileOrDirectory');

  closeMenu()
};

async function addToProjects()
{
  await $store.dispatch('addToProjects');
  closeMenu()
}

function closeMenu() {
  $store.commit('setContextMenuFile', null);
}

</script>