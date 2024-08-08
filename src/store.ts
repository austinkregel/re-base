import axios from "axios";
import {createStore} from "vuex";
import { notify } from "notiwind"
// When using the Tauri API npm package:
import { invoke } from '@tauri-apps/api/tauri'
import { path } from "@tauri-apps/api";

interface IEntity<K, V> {
    [key: string]: V;
}
// @ts-ignore
var MD5 = function(d){var r = M(V(Y(X(d),8*d.length)));return r.toLowerCase()};function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}


interface IState {
    files: IEntity<String, any>
    open?: {
        clientId: string | null;
        projectName: string | null;
        tab: string | null;
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
    user: any;
    client: (state: IState) => any,
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
        tab: (state: IState, getters: IGetters) => getters?.openFiles?.[state?.open?.tab ?? ''] ?? null,
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
        client: (state: IState) => state.clients[state.open?.client],
        openProject: (state: IState) => state.open?.client,
        open: (state: IState) => state.open,
        user: (state: IState) => state.open?.clientId,
    },
    mutations: {
        toggleTerminal(state: IState) {
            state.terminalOpen = !state.terminalOpen;
        },
        setContextMenuFile(state: IState, file: any) {
            state.contextMenuFile = file;
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
        async upsertClient(state: IState, client: any) {
            state.clients = {
                ...state.clients,
                [client.id]: client
            }

            console.log('clients', { ...state.clients })
            await invoke('upsert_clients', { clients: Object.values(state.clients)});
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
            console.log('open file', state.open?.tab)
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
            // state.open = undefined as any;
            let files = state.filesOpen;
            delete files[file.absolute]
            state.filesOpen = files;
        

            if (state.open?.tab === file.absolute && Object.keys(state.filesOpen).length > 0) {
                state.open.tab = Object.keys(state.filesOpen)[0];
                setLocalStorage('developer_open_state', state.open)
            }
        },
        updateText(state: IState, { file, data }: any) {
            state.filesOpen[file.absolute].data = data;
            state.filesOpen[file.absolute].isDirty = state.filesOpen[file.absolute].originalData !== data;
        },
        async setClients(state: IState, clients: any) {
            state.clients = clients
            await invoke('upsert_clients', { clients: Object.values(clients)});
        },
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
        deleteProject({ state, getters, commit }: IActionParameter, { client, name }: any) {
            console.log('deleting project', client, name);
            
            delete state.clients[client.id].txt[name];

            // delete txt[name];
            commit('setClients', state.clients )
        },
        async createFile(f, { name }: any) {
            await invoke('async_write_file', { 
                path: name,
                contents: "",
                md5: MD5(""),
            })
        },
        async createDirectory(_, { name, }: { name: string }) {
            await invoke('async_create_directory', { path: name })
        },
        async openProject({ dispatch, commit, state }: IActionParameter, { client, name, path }: any) {
            dispatch('openFile', {client, name, path})

            state.open.clientId = file.client.id;
            state.open.path = file.path;

            // We should also fetch details about the project's directory.
            //  .idea config
            //  .vsconfig
            //  docker-compose etc..
            // 
        },
        async openFile({ commit }: IActionParameter, { ...file }: any) {

            if (file.hasOwnProperty('is_directory')) {
                const data = await invoke('async_read_file', { path: file.path})
                commit('openFile', { 
                    data,
                    file
                })

                return;
            }
            const files = JSON.parse(await invoke('async_fetch_path', file));

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
                    await invoke('async_write_file', {
                        path: getters.tab.path,
                        contents: getters.tab.data,
                        md5: MD5(getters.tab.data),
                    });
                    // await dispatch('saveOpenFile', getters.tab);
                    // editor.session.getUndoManager().markClean()
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
            const { hostname, servers } = await invoke('initialize', {
                name: 'developer',
                clientId: client_id,
                token: localStorage.getItem('accessToken')
            } as any);
            // 

            console.log('clients',hostname, servers);
            commit('setClients', servers.reduce((clients: IEntity<String, any>, client: any) => {
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