import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import DeveloperEnvironment from './routes/DeveloperEnvironment.vue';

// Import your components here

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: DeveloperEnvironment,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes, 
});

export default router;