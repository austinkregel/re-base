const cote = require('cote');
const fs = require('fs');
const os = require('os');
const path_ = require("path");

const fetchFileOrDirectory = require('./file-helpers');

// Instantiate a new Responder component.
const fileManager = new cote.Responder({
    name: 'File Handler',
    namespace: 'file',
    respondsTo: ['can-i-haz-file', 'update-file', 'delete-file'], // types of requests this responder
});

fileManager.on('can-i-haz-file', (req, cb) => {
    const nodeThatWantsTheFile = fileManager.discovery.nodes[req.node];

    console.log('[!]', 'Is there a node?', nodeThatWantsTheFile, req);

    fetchFileOrDirectory(req.val)
        .then((contents) => {
            cb(undefined, contents)
        })
        .catch(console.error)
});

fileManager.on('update-file', (req, cb) => {
    const file = req.val;

    if (!fs.existsSync(file)) {
        cb({
            message: "404 File cannot be found."
        })

        return undefined;
    }

    cb(undefined, fs.readFileSync(file));
});

fileManager.on('delete-file', (req, cb) => {
    const file = req.val;

    if (!fs.existsSync(file)) {
        cb({
            message: "404 File cannot be found."
        })

        return;
    }

    fs.unlinkSync(file);
    cb(undefined, true);
});

const themeResponder = new cote.Responder({
    name: 'Theme responder',
    respondsTo: ['theme'],
});

themeResponder.on('theme', (req, cb) => {
    const themeFile = path_.join(__dirname, '/node_modules/ace-builds/css/theme/', req.theme + '.css');
    if (!fs.existsSync(themeFile)) {
        return cb({
            message: "No theme found by that name"
        })
    }

    cb(undefined, fs.readFileSync(themeFile, "UTF-8"));
})

const modeResponder = new cote.Responder({
    name: 'Mode slash syntax responder',
    respondsTo: ['mode'],
});

modeResponder.on('mode', (req, cb) => {
    const themeFile = path_.join(__dirname, '/node_modules/ace-builds/src/snippets/', req.theme + '.css');
    if (!fs.existsSync(themeFile)) {
        return cb({
            message: "No language mode found by that name"
        })
    }

    cb(undefined, fs.readFileSync(themeFile, "UTF-8"));
})
