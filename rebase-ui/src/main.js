import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createStore } from 'vuex'
import Swal from 'sweetalert2';
import axios from 'axios';

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
window.getLocalStorage = (key, defaultValue) => JSON.parse(localStorage.getItem(key) || defaultValue);
window.setLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const store = createStore({
    state: {
        files: [],
        open: {
            clientId: null,
            projectName: null,
        },
        clients: {},
        filesOpen: {},
        nodes: socket
    },
    getters: {
        file(state) {
            if (!state.openFile) {
                return null;
            }

            return state.files[state.openFile];
        },
        files(state) {
            return state.files.reduce((files, file) => {
                return {
                    ...files,
                    [file.absolute]: file,
                }
            }, {});
        },
        project(state) {
            return state.open.projectName
        },
        clients(state) {
            return Object.values(state.clients);
        },
        selectedClient(state){
            return state.clients[state.open.clientId]
        },
        openFiles(state) {
            return state.filesOpen;
        }
    },
    mutations: {
        upsertClient(state, client) {
            console.log('[-]','Adding client', client)
            state.clients = {
                ...state.clients,
                [client.id]: client
            }
        },
        setOpen(state, data) {
            state.open = data;
        },
        setOpenFiles(state, data) {
            state.files = data;
        },
        openFile(state, { data, file,}) {
            state.filesOpen = {
                ...state.filesOpen,
                [file.absolute]: {
                    ...file,
                    data
                }
            }
        },
        closeFile(state, file) {
            let files = state.filesOpen[file.absolute]
            delete files[file.absolute]
            state.filesOpen = files;
        },
        setClients(state, clients) {
            state.clients = clients
        },
        addClient(state, client) {
            console.log('[-]', 'Client added', client)
            state.clients.push(client)
        }
    },
    actions: {
        deleteClient({ state}, client) {
            const { [client.id]: newClient, ...clients } = state.clients;
            state.clients = clients;
        },
        createProject({ state, }, { name, path, client }) {
            axios.post('/api/projects', {
                name,
                path,
                client,
            });
        },
        deleteProject({ state, }, { id, name }) {
            axios.delete('/api/projects/' + id + '/' + name);
            let txt = state.getters.selectedClient.txt;
            delete txt[name];
            state.clients = {
                ...state.clients,
                [id]: {
                    ...state.clients[id],
                    txt
                }
            };
        },
        openProject({ commit, getters, state }, { id, name, path, ...everythingElse }) {
            console.log('[i] Opening', {
                ...everythingElse,
                clientId: id,
                projectName: name,
            })
            commit('setOpen', {
                clientId: everythingElse.client.id,
                projectName: name,
            })
            socket.emit('fetch:path', { id, name, val: path })
        },
        openFile({ state, getters, commit }, { path, id, file }) {
            socket.emit('fetch:path', { id, name, val: path })
        }
    },
})
import { io } from 'socket.io-client';
var socket = null;
function boot() {
    socket.on('connect', () => {
        socket.emit('whos-there')
    })
    socket.on('i-exist', (client) => {
        store.commit('upsertClient', client)
    });
    socket.on('success:path', (contents) => {
        console.log('[!]', 'contents found', contents)
        if (Array.isArray(contents)) {
            store.commit('setOpenFiles', contents);
        } else {
            // store.commit('openFile', { data: contents})
        }
    })
    socket.on('clients', (clients) => {
        console.log({ clients })
        store.commit('setClients', clients);
    })
}
const websocket = APP_TYPE.command === 'serve' ? 'localhost:5555' : window.location.host

socket = io.connect('ws://'+websocket, {
    transports: ['websocket']
})

boot();

const app = createApp(App);

app.use(store);

app.mount('#app')
