import axios from "axios";

export default {
    state: {
        files: [],
        open: getLocalStorage('developer_open_state', {
            clientId: null,
            projectName: null,
            tab: null,
        }),
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
        socket: undefined,
        terminals: {},
    },
    getters: {
        terminal: state => Object.values(state.terminals)[0],
        settings: state => state.settings,
        tab: (state, getters,) => getters.openFiles[state.open.tab],
        file(state) {
            if (!state.openFile) {
                return null;
            }

            return state.files[state.openFile];
        },
        files(state) {
            const files = state.files.reduce((files, file) => {
                return {
                    ...files,
                    [file.absolute]: file,
                }
            }, {});

            return files;
        },
        openFiles(state) {
            return state.filesOpen;
        },
        editor: (state) => state.editor,
        loadingFiles: (state) => state.loadingFiles,
        clients: (state) => state.clients,
        openProject: state => state.open?.client,
        socket: state => state.socket
    },
    mutations: {
        resizeTerminal(id) {},
        closeTerminal(id) {},
        setTerminal(state, terminal) {
            state.terminals = {
                ...state.terminals,
                [terminal.id]: terminal
            }
        },
        setSocket(state, socket) {
            state.socket = socket;
        },
        upsertClient(state, client) {
            state.clients = {
                ...state.clients,
                [client.id]: client
            }
        },
        setOpen(state, data) {
            state.open = data;
            setLocalStorage('developer_open_state', data)
        },
        setOpenFiles(state, data) {
            state.files = data;
        },
        openSubDirectory(state, { file, files }) {
            state.filesOpen = {
                ...state.filesOpen,
                [file.absolute]: {
                    ...file,
                    files
                }
            }
        },
        openFile(state, { data, file, ...all}) {
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
        closeFile(state, file) {
            let files = state.filesOpen;
            delete files[file.absolute]
            state.filesOpen = files;

            if (state.open.tab === file.absolute && Object.keys(state.filesOpen).length > 0) {
                state.open.tab = Object.keys(state.filesOpen)[0];
                setLocalStorage('developer_open_state', state.open)
            }
        },
        updateText(state, { file, data }) {
            state.filesOpen[file.absolute].data = data;
            state.filesOpen[file.absolute].isDirty = state.filesOpen[file.absolute].originalData !== data;
        },
        setClients(state, clients) {
            state.clients = clients
        },
        addClient(state, client) {
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
        openProject({ commit, getters, state }, { client, name, path }) {
            commit('setOpen', {
                client,
                projectName: name,
                path,
            })
            state.socket.emit('fetch:path', { id: client.id, name, path })
        },
        openFile({ state, getters, commit, dispatch }, { ...file }) {
            console.log('[!] openFile',  file)
            if (file.is_directory) {

                dispatch('openSubDirectory', {
                    file,
                    // files
                })
                state.socket.emit('fetch:path', file)

            } else {
                state.socket.emit('fetch:path',file)
            }
        },
        async setupEditor({ state, getters, commit, dispatch }, { editor }) {
            state.editor = editor;

            editor.commands.addCommand({
                name: "saveFile",
                bindKey: {win: "Ctrl-s", mac: "Command-s"},
                async exec(e) {
                    await dispatch('saveOpenFile', getters.tab);
                    editor.session.getUndoManager().markClean()
                }
            })
        },
        createTerminal({ state, getters, commit, dispatch }, { path, name, id }) {
            state.socket.emit('terminal:create', {
                path,
            });
        },
        destroyTerminal({ state, getters, commit, dispatch }, terminal) {
            console.log(terminal)
            delete state.terminals[terminal.id];
            state.socket.emit('terminal:terminate', terminal);
        }
    },
}