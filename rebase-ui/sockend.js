import cote from 'cote';
import http from 'http';
import { Socket, Server } from 'socket.io';
import fs from 'fs';
import statik from 'node-static';
import '../agent/mesh.js'
const app = http.createServer(handler);
const io = (new Server).listen(app);
const fileRequester = new cote.Requester({
    name: 'file-requester',
    namespace: 'file',
    requests: ['can-i-haz-file']
})

io.on('connection', (socket) => {
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
        console.log('disconnected')
    });
    socket.on('fetch:path', (data) => {
        console.log('[i] patch', data);
        fileRequester.send({
            type: 'can-i-haz-file',
            val: data.val,
            node: data.id
        }).then((contents) => {

            console.log('[!] success', data)
            socket.emit('success:path', contents)
        })
        .catch((error) => {
            console.error('[!] error fetching file', error, error.message)
        });
    })
});

app.listen(process.argv[2] || 5555);

function handler(req, res) {
    console.log(req.url);

    if (req.url.includes('.')) {
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
};

const sockend = new cote.Sockend(io, {
    name: 'Sockend',
    // key: 'a certain key'
});