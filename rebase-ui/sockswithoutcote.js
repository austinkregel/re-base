import http from 'http';
import { Server } from 'socket.io';
import statik from 'node-static';
import pty from 'node-pty'
let BASE_PORT = 30000;
const shell = '/bin/bash';
import fs from 'fs';
import os from 'os';
import path from 'path';
import _ from 'lodash';
import crypto from 'crypto';

const getFileObject = (file_path) => {
  const lstat = fs.lstatSync(file_path);
  const is_directory = lstat.isDirectory();
  let type = 'folder';

  if (!is_directory) {
    type = path.extname(file_path).replace('.', '').toLowerCase();

    if (!type) {
      type = file_path.replace('.', '').toLowerCase();
    }
  }

  const parts = file_path.split('/');
  const name = parts[parts.length - 1];

  return {
    absolute: crypto.createHash('md5').update(file_path).digest('hex'),
    name,
    is_directory,
    type,
    file_path,
    executable: !is_directory && (lstat.mode & fs.constants.S_IXUSR) > 0,
  };
};

async function fetchFileOrDirectory(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('[!] path does not exist', filePath);
    return [];
  }

  if (fs.lstatSync(filePath).isDirectory()) {
    const files = fs.readdirSync(filePath).map((file) => {
      const file_path = path.join(filePath, file);
      return getFileObject(file_path);
    });
    let { true: folders, false: allFiles } = _.groupBy(files, (file) => file.is_directory);

    folders = _.sortBy(folders, ['name']);
    allFiles = _.sortBy(allFiles, ['name']);

    return {
      files: folders.concat(allFiles),
      file: getFileObject(filePath),
    };
  }

  return {
    data: fs.readFileSync(filePath, 'utf-8'),
    file: getFileObject(filePath),
  };
}
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
    var ptyProcess;
    var terminal = null;
    console.log('[!] socket connected');
    // // each socket will have it's own responder since each tab could have its own terminal open
    socket.on('whos-there', () => {
        // socket.emit('clients', socket)
        socket.emit('i-exist', {
            name: os.hostname(),
            txt: {
                id: socket.id,
                'rebase-ui': process.cwd(),
            }
        })
    });
    socket.on('disconnected', () => {
        ptyProcess.kill();
        console.log('disconnected')
    });

    socket.on('fetch:path', (data) => {
        // Sockend needs to request the file from the given node.
        console.log('[!] success:path called');
        console.log('[!] fetch:path called', data);
        fetchFileOrDirectory(data.path)
            .then((contents) => {
                socket.emit('success:path', contents)
            })
    })

    // Socket messages come from the UserInterface, the user interface will listen over websocket.
    socket.on('terminal:resize', ({ pid, width, height}) => {
        console.log('[!] terminal:resize called');
        // we should request a terminal resize from cote for a given node.
        ptyProcess.resize(width, height);
    });

    socket.on('terminal:key', (data) => {
        if (!ptyProcess) {
            socket.emit('message', 'No terminal session found.')
            return;
        }

        // console.log('process ', data)
        ptyProcess.write(data);
    })

    socket.on('terminal:create', ({ id, name, path}) => {
        console.log('[!] terminal:created called');
        // we should request a terminal to be created from cote for a given node.
        // This creation should return some kind of PID.
        console.log (path ?? process.env.HOME)
        ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: path ?? process.env.HOME,
            env: process.env
        });
        terminal = { id: ptyProcess.pid, name, path };
        ptyProcess.onData((data) => {
            socket.emit('terminal:data', data);
        })

        ptyProcess.onExit(() => {
            console.log('terminal exited');
            socket.emit('terminal:terminated', terminal);

            terminal = null;
        })

        socket.emit('terminal:created', terminal)
    });
    socket.on('terminal:terminate', (terminal) => {
        // the UI is requesting the terminal be terminated.
        console.log('requesting to terminate', terminal)
        process.kill(terminal.id, 1);
    });
});

app.listen(5555);
