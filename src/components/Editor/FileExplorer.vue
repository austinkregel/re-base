<template>
    <ContextMenu>
        <file-or-folder
              v-for="file in $store.getters.files"
              :key="file.absolute"
              :file="file"
              @contextmenu="($event) => $store.commit('setContextMenuFile', file)"
        ></file-or-folder>
        <pre>{{  $store.state.open }}</pre>
        <pre>{{  $store.state.contextMenuFile }}</pre>
        <template #items="{ close  }">
            <div class="flex flex-col divide-y divide-stone-500">
                <Item @click="createDirectory">New Directory</Item>
                <Item @click="createFile">New File</Item>
                <Item @click="destroy">Delete</Item>
                <Item @click="addToProjects">Add to projects</Item>
                <Item v-if="$store.state?.open?.path" @click="() => { $store.dispatch('openFile', { path: $store.state?.open?.path, client: $store.getters.clients[$store.state.open.clientId] }); close() }">Refresh Directory</Item>
            </div>
        </template>
    </ContextMenu>
</template>

<script setup>
import ContextMenu from '../../ContextMenus/ContextMenu.vue';
import Item from '../Atoms/Menus/Item.vue';
import FileOrFolder from '../FileOrFolder.vue';
import { useStore } from 'vuex';

const $store = useStore();

async function createDirectory() {
  const name = prompt('Enter a name for the new directory');

  if (name) {
    const folderPath = $store.state.open.path + '/'+name
   
    await $store.dispatch('createDirectory', {
      name: folderPath
    })
  }
  closeMenu()

};
async function createFile() {
  const name = prompt('Enter a name for the new file');

  if (name) {
    // We need to pass an absolute file path to create file.
    const filePath = $store.state.open.path + '/'+name

    await $store.dispatch('createFile', {
      name: filePath
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