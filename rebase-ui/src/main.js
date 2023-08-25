import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createStore } from 'vuex'
import Swal from 'sweetalert2';
import axios from 'axios';
import devStore from './store.js';
const $on = () => {

}
const $off = () => {

}
window.Bus = {
    $on,
    $off
}
window.Swal = Swal;
window.axios = axios
window.getLocalStorage = (key, defaultValue) => JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue));
window.setLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const store = createStore(devStore)
import { io } from 'socket.io-client';
import loadingAscii from "./components/LoadingAscii.vue";
var socket = null;
function boot() {
    store.commit('setSocket', socket)
    socket.on('connect', () => {
        socket.emit('whos-there')
    });

    socket.on('disconnect', () => {
        store.commit('setClients', [])
        console.log( 'disconnected from socket')
    });

    socket.on('i-exist', (client) => {
        store.commit('upsertClient', client)
    });
    socket.on('success:path', ({ files, file, data, ...all}) => {
        if (Array.isArray(files)) {
            store.commit('setOpenFiles', files);
        } else {
            store.commit('openFile', { file, data})
        }
    })
    socket.on('clients', (clients) => {
        store.commit('setClients', clients);
    });
    socket.on('terminal:created', (terminal) => {
        console.log('terminal:created', terminal);
        store.commit('setTerminal', terminal);
    });
    socket.on('terminal:terminated', terminal => {

    })
}
const websocket = APP_TYPE.command === 'serve' ? 'localhost:5555' : window.location.host

socket = io.connect('ws://'+websocket, {
    transports: ['websocket']
})

boot();

const app = createApp(App);

app.component('loading-ascii', loadingAscii)
app.use(store);

app.mount('#app')
