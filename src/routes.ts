import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import DeveloperEnvironment from './routes/DeveloperEnvironment.vue';
import Login from './routes/Auth/Login.vue';
import ErrorPage from './routes/ErrorPage.vue';
import Index from './routes/Developer/Index.vue';
// Import your components here

const routes: Array<RouteRecordRaw> = [
    {
        path: '/-',
        name: 'Home',
        component: DeveloperEnvironment,
        meta: {
            forceAuth: true
        },
        children: [
            {
                path: '',
                component: Index,
                meta: {
                    forceAuth: true
                },
            }
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            forceAuth: false
        },
    },
    {
        path: '/',
        redirect: '/-',
    },
    {
        path: '/:pathMatch(.*)*',
        name: '404',
        component: ErrorPage,

        meta: {
            forceAuth: true
        },
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes, 
});

router.beforeEach((to, from, next) => {
    if (to.meta.forceAuth && !localStorage.getItem('accessToken')) {
        next({ name: 'Login' });
    } else {
        next();
    }
})

export default router;