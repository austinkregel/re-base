import axios from "axios";
import {createStore} from "vuex";
import { notify } from "notiwind"
// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/tauri'

interface IEntity<K, V> {
    [key: string]: V;
}

interface IState {
    files: IEntity<String, any>
    open?: {
        clientId: string | null;
        projectName: string | null;
        tab: string;
    };
    clients: any;
    filesOpen: any;
    editor: any;
    loadingFiles: boolean;
    settings: {
        sourceDirectory: string[];
        blacklistDirectory: string[];
        vendorDirectory: string[];
        projectPaths: string[];
        testDirectory: string[];
        packageVersionControl: string[];
        packageVersionControlLockFiles: string[];
        editor: {
            tabSize: number;
            useWorker: boolean;
            printMargin: number;
            enableBasicAutocompletion: boolean;
            enableLiveAutocompletion: boolean;
            animatedScroll: boolean;
            autoScrollEditorIntoView: boolean;
            behavioursEnabled: boolean;
            copyWithEmptySelection: boolean;
            cursorStyle: string;
            customScrollbar: boolean;
            displayIndentGuides: boolean;
            dragEnabled: boolean;
            enableAutoIndent: boolean;
            enableBlockSelect: boolean;
            enableCodeLens: boolean;
            enableEmmet: boolean;
            enableLinking: boolean;
            enableMultiselect: boolean;
            enableSnippets: boolean;
            fadeFoldWidgets: boolean;
            firstLineNumber: number;
            fixedWidthGutter: boolean;
            fontFamily: string;
            fontSize: string;
            hScrollBarAlwaysVisible: boolean;
            hardWrap: boolean;
            hasCssTransforms: boolean;
            highlightActiveLine: boolean;
            highlightGutterLine: boolean;
            highlightIndentGuides: boolean;
            highlightSelectedWord: boolean;
            indentedSoftWrap: boolean;
            printMarginColumn: boolean;
            readOnly: boolean;
            relativeLineNumbers: boolean;
            rtl: boolean;
            scrollPastEnd: boolean;
            showFoldWidgets: boolean;
            showGutter: boolean;
            showInvisibles: boolean;
            showLineNumbers: boolean;
            showPrintMargin: boolean;
            spellcheck: boolean;
            tooltipFollowsMouse: boolean;
            useElasticTabstops: boolean;
            useIncrementalSearch: boolean;
            useSoftTabs: boolean;
            useTextareaForIME: boolean;
            vScrollBarAlwaysVisible: boolean;
            wrap: boolean;
            wrapBehavioursEnabled: boolean;
            wrapMethod: string;
        }
    };
    socket: any;
    terminals: any;
    terminalOpen: boolean;
    openFile?: string;
    contextMenuFile?: any;
}

interface IGetters {
    terminal: any;
    terminalsOpen: any;
    settings: any;
    tab: any;
    file: any;
    files: any;
    openFiles: any;
    editor: any;
    loadingFiles: (state: IState) => boolean;
    clients: any;
    openProject: any;
    socket: any;
    open: any;
}

interface IActionParameter {
    state: IState;
    commit: any;
    dispatch: any;
    getters: IGetters;
}

interface IFile {
    absolute: string;
    name: string;
    is_directory: boolean;
}

const getLocalStorage = (key: string, defaultValue?: any) => JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue));
const setLocalStorage = (key: string, value?: any) => localStorage.setItem(key, JSON.stringify(value));

function generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    let firstPart: string | number = (Math.random() * 46656) | 0;
    let secondPart: string | number = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}


const store: {
    state: IState,
    getters: IGetters,
    mutations: any,
    actions: any,
} = {
    state: {
        files: [],
        // @ts-ignore
        open: getLocalStorage('developer_open_state', {
            clientId: null,
            projectName: null,
            tab: null,
        }) as {
            clientId: string | null;
            projectName: string | null;
            tab: string | null;
        },
        clients: {},
        filesOpen: {},
        editor: null,
        loadingFiles: false,
        settings: {
            // Source directories will be marked in blue
            sourceDirectory: ['app', 'src', 'resources', 'system'],
            // blacklist directories are marked by gray text, and won't be indexed
            blacklistDirectory: ['bootstrap', 'public'],
            // vendor directories, files, etc, will be index but only when the program is started
            vendorDirectory: ['vendor', 'node_modules'],
            // project paths are marked in gold, and represent a known rebase path.
            projectPaths: [],
            // tests are marked in green
            testDirectory: ['tests'],
            packageVersionControl: ['package.json', 'composer.json', 'docker-compose.yml'],
            packageVersionControlLockFiles: ['package-lock.json','yarn.lock', 'composer.lock'],
            editor: {
                tabSize: 4,
                useWorker: true,
                printMargin: 180,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                animatedScroll: false,
                autoScrollEditorIntoView: false,
                behavioursEnabled: true,
                copyWithEmptySelection: false,
                cursorStyle: 'ace',
                customScrollbar: false,
                displayIndentGuides: true,
                // dragDelay: '',
                dragEnabled: true,
                enableAutoIndent: true,
                enableBlockSelect: false,
                enableCodeLens: true,
                enableEmmet: true,
                enableLinking: true,
                enableMultiselect: false,
                enableSnippets: false,
                fadeFoldWidgets: false,
                firstLineNumber: 1,
                fixedWidthGutter: false,
                fontFamily: 'monospace',
                fontSize: '16px',
                hScrollBarAlwaysVisible: false,
                hardWrap: false,
                hasCssTransforms: false,
                highlightActiveLine: true,
                highlightGutterLine: true,
                highlightIndentGuides: true,
                highlightSelectedWord: true,
                indentedSoftWrap: false,
                printMarginColumn: true,
                readOnly: false,
                relativeLineNumbers: false,
                rtl: false,
                scrollPastEnd: true,
                showFoldWidgets: true,
                showGutter: true,
                showInvisibles: true,
                showLineNumbers: true,
                showPrintMargin: true,
                spellcheck: true,
                tooltipFollowsMouse: true,
                useElasticTabstops: false,
                useIncrementalSearch: true,
                useSoftTabs: true,
                useTextareaForIME: false,
                vScrollBarAlwaysVisible: false,
                wrap: false,
                wrapBehavioursEnabled: false,
                wrapMethod: 'auto',
            }
        },
        terminals: {},
        terminalOpen: false,
        openFile: '',
        contextMenuFile: null,
    },
    getters: {
        terminal: (state: IState) => Object.values(state.terminals)[0],
        terminalsOpen: (state: IState): boolean => state.terminalOpen,
        settings: (state: IState) => state.settings,
        tab: (state: IState, getters: IGetters) => getters.openFiles[state?.open?.tab ?? ''],
        file(state: IState) {
            if (!state.openFile) {
                return null;
            }

            return state.files[state.openFile];
        },
        files(state: IState) {
            const files = state.files.reduce((files: IEntity<String, IFile>, file: IFile) => {
                return {
                    ...files,
                    [file.absolute]: file,
                }
            }, {} as any);

            return files;
        },
        openFiles(state: IState) {
            return state.filesOpen;
        },
        editor: (state: IState) => state.editor,
        loadingFiles: (state: IState) => state.loadingFiles,
        clients: (state: IState) => state.clients,
        openProject: (state: IState) => state.open?.client,
        socket: (state: IState) => state.socket,
        open: (state: IState) => state.open,
    },
    mutations: {
        toggleTerminal(state: IState) {
            state.terminalOpen = !state.terminalOpen;
        },
        setContextMenuFile(state: IState, file: any) {
            state.contextMenuFile = file;
            console.log('set context menu file', file)
        },
        // @ts-ignore
        resizeTerminal(state: IState, id: string) {},
        // @ts-ignore
        closeTerminal(state: IState, id: string) {},
        setTerminal(state: IState, terminal: any) {
            state.terminals = {
                ...state.terminals,
                [terminal.id]: terminal
            }
        },
        upsertClient(state: IState, client: any) {
            state.clients = {
                ...state.clients,
                [client.id]: client
            }
        },
        setOpen(state: IState, data: any) {
            state.open = data;
            setLocalStorage('developer_open_state', data)
        },
        setOpenFiles(state: IState, data: any) {
            state.files = data;
        },
        openSubDirectory(state: IState, { file, files }: any) {
            state.filesOpen = {
                ...state.filesOpen,
                [file.absolute]: {
                    ...file,
                    files
                }
            }
        },
        openFile(state: IState, { data, file }: any) {
            if (typeof data !== 'string') {
                data = JSON.stringify(data, null, 4);
            }
            state.filesOpen = {
                ...state.filesOpen,
                [file.absolute]: {
                    ...file,
                    data,
                    originalData: data,
                    isDirty: false,
                }
            };
            if (!state.open) {
                // @ts-ignore
                state.open = {}
            }

            // @ts-ignore
            state.open.tab = file.absolute;
            const modeList = ace.require("ace/ext/modelist")

            let expectedMode = modeList.getModeForPath(file.name)
            ace.require(expectedMode.name);
            state.editor?.getSession()?.setMode(expectedMode.name)

            if (!['coffee', 'css','html','javascript','json','lua','php','xml','xquery'].includes(expectedMode.name)) {
                return;
            }

            try {
                ace.config.setModuleUrl('ace/mode/' + expectedMode.name +'_worker', 'assets/worker-' + expectedMode.name + '.js');
            } catch (e) {
                console.error(e);
                // Not every language type will have a worker, but that doesn't mean we can't try to load it.
            }
        },
        closeFile(state: IState, file: any) {
            let files = state.filesOpen;
            delete files[file.absolute]
            state.filesOpen = files;

            if (state.open.tab === file.absolute && Object.keys(state.filesOpen).length > 0) {
                state.open.tab = Object.keys(state.filesOpen)[0];
                setLocalStorage('developer_open_state', state.open)
            }
        },
        updateText(state: IState, { file, data }: any) {
            state.filesOpen[file.absolute].data = data;
            state.filesOpen[file.absolute].isDirty = state.filesOpen[file.absolute].originalData !== data;
        },
        setClients(state: IState, clients: any) {
            state.clients = clients
        },
        addClient(state: IState, client: any) {
            state.clients.push(client)
        }
    },
    actions: {
        deleteClient({ state }: IActionParameter, client: any) {
            const { [client.id]: newClient, ...clients } = state.clients;
            state.clients = clients;
        },
        // @ts-ignore
        createProject(a: any, { name, path, client }: any) {
            axios.post('/api/projects', {
                name,
                path,
                client,
            });
        },
        deleteProject({ state, getters }: IActionParameter, { id, name }: any) {
            // delete txt[name];
            // state.clients = {
            //     ...state.clients,
            //     [id]: {
            //         ...state.clients[id],
            //         txt
            //     }
            // };
        },
        async openProject({ dispatch, commit, state }: IActionParameter, { client, name, path }: any) {
            dispatch('openFile', {client, name, path})
        },
        async openFile({ state, dispatch, commit }: IActionParameter, { ...file }: any) {
            const files = JSON.parse(await invoke('async_fetch_path', file));

            console.log('[!] openFile',  file, files )
            state.open.clientId = file.client.id;
            if (file.is_directory) {

                commit('openSubDirectory', {
                    file,
                    files
                })
                // commit('setOpenFiles', files)

            } else {
                commit('setOpenFiles', files)
            }
        },
        async setupEditor({ state, getters, dispatch }: IActionParameter, { editor }: any) {
            state.editor = editor;

            editor.commands.addCommand({
                name: "saveFile",
                bindKey: {win: "Ctrl-s", mac: "Command-s"},
                async exec() {
                    await dispatch('saveOpenFile', getters.tab);
                    editor.session.getUndoManager().markClean()
                }
            })
        },
        createTerminal({  }: IActionParameter, { path, name, id }: any) {
            invoke('terminal:create', {
                path,
            });
        },
        destroyTerminal({ state, getters, commit, dispatch }: IActionParameter, terminal: any) {
            console.log(terminal)
            delete state.terminals[terminal.id];
            invoke('terminal:terminate', terminal);
        },
        async initialize({ commit }: IActionParameter) {
            console.log('initializing')
            let client_id = getLocalStorage('client_id', null);

            if (!client_id) {
                client_id = generateUID();
                setLocalStorage('client_id', client_id);
            }


            // We need to setup listeners for tauri events here.
            const { hostname, clients } = await invoke('initialize', {
                name: 'developer',
                client_id: client_id,
            }) as any;
            // 

            console.log('clients',hostname, clients);
            commit('setClients', clients.reduce((clients: IEntity<String, any>, client: any) => {
                return {
                    ...clients,
                    [client.id]: client
                }
            }, {} as any));
        },  
        async deinitialize({ commit, state }: IActionParameter) { 
            await invoke('deinitialize', state.open?.clientId);
        },

        addToProjects({ state, commit }: IActionParameter) {
            if (!state.contextMenuFile?.is_directory) {
                notify({ 
                    group: 'error',
                    title: 'Error',
                    text: 'You can only add directories to projects',
                    position: 'bottom-right',
                }, 5000);
                return;
            }

            if (!state.open?.clientId) {
                console.log('state.open.clientId is not set to a value: ', state.open?.clientId)
                return;
            }

            const client = state.clients[state.open.clientId];

            commit('upsertClient', {
                ...client,
                txt: {
                    ...(client?.txt ?? {}),
                    [state.contextMenuFile.name]: state.contextMenuFile.path,

                }
            });
        }
    },
};


export default createStore(store);