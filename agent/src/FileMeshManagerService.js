// Instantiate a new Responder component.
const cote = require("cote");
const fetchFileOrDirectory = require("../file-helpers");
const fs = require("fs");
const fileManager = new cote.Responder({
    name: 'File Handler',
    namespace: 'file',
    respondsTo: ['can-i-haz-file', 'update-file', 'delete-file'], // types of requests this responder
});

fileManager.on('can-i-haz-file', (req, cb) => {
    const nodeThatWantsTheFile = fileManager.discovery.nodes[req.node];

    // Is this a node with permission?
    if (/* check for auth somehow? */false) {
        // nodeThatWantsTheFile
    }
    fetchFileOrDirectory(req.path)
        .then((contents) => {
            cb(undefined, contents)
        })
        .catch(console.error)
});
fileManager.on('update-file', (req, cb) => {
    const file = req.path;

    if (!fs.existsSync(file)) {
        cb({
            message: "404 File cannot be found."
        })

        return undefined;
    }

    cb(undefined, fs.readFileSync(file));
});

fileManager.on('delete-file', (req, cb) => {
    const file = req.path;

    if (!fs.existsSync(file)) {
        cb({
            message: "404 File cannot be found."
        })

        return;
    }

    fs.unlinkSync(file);
    cb(undefined, true);
});
