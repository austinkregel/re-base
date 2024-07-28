<script setup>
import LeftThird from "./routes/LeftThird.vue";
import CommandPalette from "./components/CommandPalette.vue";
import { onMounted } from "vue";
import { useStore } from 'vuex';
import DynamicIcon from "./components/Atoms/Icons/DynamicIcon.vue";
const store = useStore();
onMounted(() => {
  store.dispatch('initialize');
});

</script>

<template>
  <div class="flex max-h-screen w-full bg-neutral-900 h-full text-gray-900 dark:text-white">
    <left-third></left-third>
    <RouterView /> 
    <CommandPalette />

    <NotificationGroup group="error">
      <div
        class="fixed inset-0 flex items-end justify-end p-6 px-4 py-6 pointer-events-none"
      >
        <div class="w-full max-w-sm">
          <Notification
            v-slot="{ notifications }"
            enter="transform ease-out duration-300 transition"
            enter-from="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
            enter-to="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-500"
            leave-from="opacity-100"
            leave-to="opacity-0"
            move="transition duration-500"
            move-delay="delay-300"
          >
            <div class="flex w-full max-w-sm mx-auto mt-4 overflow-hidden bg-white dark:bg-stone-700 rounded-lg shadow-md" v-for="notification in notifications" :key="notification.id">
              <div class="flex items-center justify-center w-12 bg-red-500 dark:bg-red-700">
                <DynamicIcon icon-name="RocketLaunchIcon" class="w-6 h-6 text-white" :active="true" />
              </div>

              <div class="px-4 py-2 -mx-3">
                <div class="mx-3">
                  <span class="font-semibold text-red-500 dark:text-red-500">{{ notification.title }}</span>
                  <p class="text-sm text-gray-600 dark:text-white">{{ notification.text }}</p>
                </div>
              </div>
            </div>
          </Notification>
        </div>
      </div>
    </NotificationGroup>
  </div>
</template>
