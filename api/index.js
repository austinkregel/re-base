const express = require('express');
const path_ = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Bus = require('./app/EventBus');
const bus = new Bus;
const clientServer = require('./app/mdns-server');
const browser = clientServer(bus);
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
let clients = {};

io.on('connection', (socket) => {
    bus.addSocket(socket.id, socket);
    socket.on('disconnect', () => bus.deleteSocket(socket.id))
    clients = browser.list().reduce((allClients, client) => {
        return {
            ...allClients,
            [client.txt.id]: client,
        }
    }, {});
    socket.emit('clients', clients);
})

app.use(express.static('public'));
app.use(cors({
    origin: '*'
})) // include before other routes
app.use(bodyParser.json());
app.use('/theme-:name', (req, res) => res.sendFile(path_.join(__dirname, '/node_modules/brace/theme/', req.params.name)))
app.use('/mode-:name', (req, res) => res.sendFile(path_.join(__dirname, '/node_modules/brace/mode/', req.params.name)))

app.post('/api/projects', async (req, res) => {
    const path = req.body.path;
    const clientId = req.body.client;
    const name = req.body.name;

    if (!path || !name || !clientId) {
        return res.status(422).send({
            message: "Your name, path, or client keys are not set, they must be non-empty strings."
        })
    }

    const client = clients[clientId];

    try {
        await axios.post('http://' + client.addresses[0] + ':' + client.port + '/api/projects', {
            path,
            name
        })

        client.txt[name] = path;

        bus.emit('client:updated', client)

        res.send({
            message: "Created"
        })
    } catch (e) {
        console.log(e);
    }
});
app.post('/api/files/:id', async (req, res) => {
    const id = req.params.id;
    const path = req.body.path;

    if (!id || !path) {
        return res.status(404).send({
            message: "No record exists"
        })
    }

    const client = clients[id];
    console.log(path);

    axios.post('http://' + client.addresses[0] + ':' + client.port + '/api/file', {
        path: path
    })
        .then(({ data }) => {
            res.send(data);
        })
        .catch(console.error)
});
app.delete('/api/projects/:id/:name', async (req, res) => {
    const id = req.params.id;
    const name = req.params.name;

    if (!id || !name) {
        return res.status(404).send({
            message: "No record exists"
        })
    }

    const client = clients[id];

    try {
        await axios.delete('http://' + client.addresses[0] + ':' + client.port + '/api/projects/' + name)

    } catch (e) {
        console.log(e);
    }
    res.status(204).send('');
})

app.use('/', (req, res) => res.sendFile(path_.join(__dirname, '/public/index.html')))

server.listen(3000, () => console.log('Running on port 3000'));
