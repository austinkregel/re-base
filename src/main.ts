import { createApp } from "vue";
import App from "./App.vue";
import './style.css'
import axios from 'axios';
import devStore from './store.js';
import router from './routes.js';
import Notifications from 'notiwind';
import loadingAscii from "./components/LoadingAscii.vue";
// @ts-ignore
window.axios = axios
// @ts-ignore
window.getLocalStorage = (key: string, defaultValue?: string | number) => JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue));
// @ts-ignore
window.setLocalStorage = (key:string , value?: string | number) => localStorage.setItem(key, JSON.stringify(value));


const app = createApp(App);
app.component('loading-ascii', loadingAscii);

// @ts-ignore
app.use(devStore)
    .use(router)
    .use(Notifications);
app.mount("#app");
