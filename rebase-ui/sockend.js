import cote from 'cote';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import statik from 'node-static';
import '../agent/mesh.js'
import os from 'os';

let BASE_PORT = 30000;

const fileRequester = new cote.Requester({
    name: 'file-requester',
    namespace: 'file',
    requests: ['can-i-haz-file']
});

const terminalRequester = new cote.Requester({
    name: os.hostname()+'-terminal-sockend',
    namespace: 'term',
    requests: ['terminal:terminate', 'terminal:create', 'terminal:resize']
})

const app = http.createServer((req, res) => {
    if (req.url.includes('.')) {
        // assume that if the URL has a dot in it, we're probably looking for a static asset
        // api routes won't have a dot in them by convention.
        const file = new statik.Server('./dist');
        return file.serve(req, res);
    }

    fs.readFile( './dist/index.html', (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
});

const io = (new Server).listen(app);

io.on('connection', (socket) => {
    console.log('[!] socket connected');
    // // each socket will have it's own responder since each tab could have its own terminal open
    const terminalClientResponder = new cote.Requester({
        name: 'terminal-client',
        namespace: 'term',
        respondsTo: ['terminal:data', 'terminal:terminated'],
        broadcasts: ['terminal:create', 'terminal:key'],
        port: BASE_PORT,
    });
    terminalClientResponder.on('terminal:data', (data) => {
        console.log('[!] terminal:data called');
        socket.emit('terminal:data', data)
    });
    terminalClientResponder.on('terminal:terminated', () => {
        console.log('[!] terminal:terminated called');
        socket.emit('terminal:terminated');
    });

    socket.on('whos-there', () => {
        // socket.emit('clients', socket)
        const me = sockend.discovery.me;
        console.log('[!] Im here', me)
        socket.emit('i-exist', {
            ...me,
            name: me.advertisement.name,
            txt: {
                id: me.id,
                'rebase-ui': process.cwd(),
            }
        })
    });
    socket.on('disconnected', () => {
        terminalClientResponder.off();
        console.log('disconnected')
    });

    socket.on('fetch:path', (data) => {
        // Sockend needs to request the file from the given node.
        fileRequester.send({
            type: 'can-i-haz-file',
            path: data.path,
            node: data.id
        }).then((contents) => {
            console.log('[!] success:path called');
            socket.emit('success:path', contents)
        })
        .catch((error) => {
            console.error('[!] error fetching file', error, error.message)
        });
    })

    // Socket messages come from the UserInterface, the user interface will listen over websocket.
    socket.on('terminal:resize', ({ pid, width, height}) => {
        console.log('[!] terminal:resize called');
        // we should request a terminal resize from cote for a given node.
        terminalRequester.send({
            type: 'terminal:resize',
            pid,
            width,
            height
        })
    });

    socket.on('terminal:key', (data) => {
        terminalClientResponder.send({
            type: 'terminal:key',
            data
        })
    })

    socket.on('terminal:create', () => {
        console.log('[!] terminal:created called');
        // we should request a terminal to be created from cote for a given node.
        // This creation should return some kind of PID.
        terminalRequester.send( {
            type: 'terminal:create',
        }).then((args) => {
            console.log('Terminal created', args);
            socket.emit('terminal:data', args)

        })
        .catch((e) => {
            console.error('error hapepenenening', e);
        })
            .finally(() => {console.log('something finally happened')})
    });
    socket.on('terminal:terminate', (...args) => {
        // the UI is requesting the terminal be terminated.
        console.log('requesting to terminate', args)
    });
});

app.listen(5555);

const sockend = new cote.Sockend(io, {
    name: 'Sockend',
    // key: 'a certain key'
    port: 5555,
});
