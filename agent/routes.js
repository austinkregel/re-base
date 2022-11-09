const fs = require('fs');
const bodyParser = require('body-parser');
const os = require('os');
const path_ = require('path');
const { encode, decode } = require('js-base64');
const crypto = require('crypto')
const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');
const _ = require('lodash');

module.exports = (app, client) => {

    app.use(bodyParser.json())
    app.use(function (req, res, next) {
        const authenticated = true;

        if (!authenticated) {
            res.status(403).send({
                message: 'Unauthenticated.'
            })
            return;
        }

        next()
    })

    // For each new project, we have to update the client's mDNS record with the project/path
    // And we have to save the new mDNS records.
    app.post('/api/projects', (req,  res) => {
        const path = req.body.path;
        const name = req.body.name;

        if (!path || !name) {
            return res.status(422).send({
                message: "Your name or path keys are not set, they must be non-empty strings."
            })
        }

        if (!fs.existsSync(path)) {
            res.status(404).send({
                message: "No file found"
            });
            return;
        }

        const configFile = path_.join(os.homedir(), '.rebase', 'config.json');

        const config = JSON.parse(fs.readFileSync(configFile, "UTF-8"));

        fs.writeFileSync(configFile, JSON.stringify({
            ...config,
            [name]: path,
        }, null, 4));

        client.updateTXT({
            ...config,
            [name]: path,
        })

        res.send({
            message: 'Project added'
        })
    });
    app.delete('/api/projects/:name', (req,  res) => {
        const name = req.params.name;

        if (!name) {
            return res.status(422).send({
                message: "Your name or path keys are not set, they must be non-empty strings."
            })
        }

        if (name === 'id') {
            return res.status(418).send({
                message: "I'm a tea pot."
            })
        }

        const configFile = path_.join(os.homedir(), '.rebase', 'config.json');

        const config = JSON.parse(fs.readFileSync(configFile, "UTF-8"));

        delete config[name];
        fs.writeFileSync(configFile, JSON.stringify({
            ...config,
        }, null, 4));

        client.updateTXT({
            ...config,
        })

        res.send({
            message: 'Project removed'
        })
    });

    app.post('/api/file', async (req,  res) => {
        const path = req.body.path;

        if (!fs.existsSync(path)) {
            res.status(404).send({
                message: "No file found"
            })
            return;
        }

        if (fs.lstatSync(path).isDirectory()) {
            const files = await Promise.all(fs.readdirSync(path).map(async file => {
                let lstat = fs.lstatSync(path_.join(path, file));
                const is_directory = lstat.isDirectory();

                let type = 'folder';

                if (!is_directory) {
                    type = path_.extname(file).replace('.', '').toLowerCase()

                    if (!type) {
                        type = file.replace('.', '').toLowerCase()
                    }
                }

                const file_path = path_.join(path, file);
                return {
                    absolute: md5(file_path),
                    name: file,
                    is_directory,
                    type,
                    file_path,
                }
            }));
            let { true: folders, false: allFiles } =_.groupBy(files, file => file.is_directory);

            folders = _.sortBy(folders, ['name'])
            allFiles = _.sortBy(allFiles, ['name'])

            return res.send(folders.concat(allFiles));
        }

        res.send(fs.readFileSync(path));
    });
    app.put('/api/file/:file', (req,  res) => {
        const file = req.params.file;

        let text = decode(file);

        if (!fs.existsSync(text)) {
            res.status(404).send({
                message: "No file found"
            })
            return;
        }

        fs.writeFileSync(text, req.body)

        res.send(fs.readFileSync(text));
    });

    app.post('/api/file/:file', (req,  res) => {
        const file = req.params.file;
        let text = decode(file);
        if (!fs.existsSync(text)) {
            res.status(404).send({
                message: "No file found"
            })
            return;
        }

        fs.writeFileSync(text, '');

        res.status(201).send('')
    });

    app.delete('/api/file/:file', (req, res) => {
        const file = req.params.file;

        let text = decode(file);

        if (!fs.existsSync(text)) {
            res.status(404).send({
                message: "No file found"
            })
            return;
        }

        fs.unlinkSync(text);

        res.status(204).send('')
    })
}