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
            state.clients = {
                ...state.clients,
                [client.txt.id]: client
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
        }
    },
    actions: {
        upsertClient({ commit }, client) {
            commit('upsertClient', client);
        },
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
        openProject({ commit, getters, state }, { id, name, path }) {
            commit('setOpen', {
                clientId: id,
                projectName: name
            })
            // once we open a project, we need to fetch the files.
            axios.post('/api/files/' + id, {
                path,
            })
                .then(({ data }) => {
                    commit('setOpenFiles', data);
                })
                .catch(e => console.error(e.message))
        },
        openFile({ state, getters, commit }, { path, id, file }) {
            axios.post('/api/files/' + getters.selectedClient.txt.id, {
                path,
            })
                .then(({ data }) => {
                    commit('openFile', { data, file })
                    Bus.$emit('fileChanged', file);
                })
        }
    },
})
import Socket from 'socket.io-client';
let socket = null;
function boot() {
    socket.on('client:connected', client => {
        console.log({ client })
        store.dispatch('upsertClient', client);
    })
    socket.on('client:updated', client => {
        console.log({ client })
        store.dispatch('upsertClient', client);
    })
    socket.on('client:disconnected', client => {
        console.log({ client })
        store.dispatch('deleteClient', client);
    })

    socket.on('clients', clients => {
        Object.keys(clients).map(clientId => store.dispatch('upsertClient', clients[clientId]));
    })
}

socket = Socket('ws://localhost:3000', {
    transports: ['websocket']
})

boot();

const app = createApp(App);

app.use(store);

app.mount('#app')
