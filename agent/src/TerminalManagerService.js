// Instantiate a new Responder component.
const cote = require("cote");
const fs = require("fs");
const pty = require('node-pty')
const os = require('os')

const terminalSessions = {};

const terminalResponder = new cote.Responder({
    name: os.hostname()+'-terminal-node',
    namespace: 'terminal',
    respondsTo: ['terminal:create', 'terminal:resize', 'terminal:terminate'], // types of requests this responder
    port: 22220
});

terminalResponder.on('terminal:create', (req, cb) => {
   // cb(error, response)

    console.log('[!] terminal:create called, launching pty session');
    var pty = require('node-pty');

    var shell = 'bash';

    var ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    ptyProcess.onData((data) => {
        console.log('[!]', 'Terminal data');
        cb(null, data);
        terminalResponder.emit('terminal:data', data);
    });

    ptyProcess.onExit(({ exitCode, signal}) => {
        console.log('[!]', 'Terminal terminated', { exitCode, signal });
        terminalResponder.emit('terminal:terminated', { exitCode, signal });
    });
    ptyProcess.write('ls\r');
    ptyProcess.resize(100, 40);
    ptyProcess.write('ls\r');

    console.log(ptyProcess);

});