const express = require('express');
const app = express();
const fs = require('fs');
const os = require('os');
const path = require('path');
const dnssd = require('dnssd');

function generateId(length) {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const ad = new dnssd.Advertisement(dnssd.tcp('client'), 34059, {
    subtypes: [{type: 'http'}],
    host: generateId(8),
    txt: {}
});

ad.start();
require('./routes')(app, ad);

const configDir = path.join(os.homedir(), '.rebase');
const configFile = path.join(os.homedir(), '.rebase', 'config.json');

if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir);
}

if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, JSON.stringify({
        id: generateId(8),
    }, null, 4))
}

const config = JSON.parse(fs.readFileSync(configFile));

const server = app.listen(0, () => {
    console.log('Started agent on http://localhost:'+server.address().port)
    ad.port = server.address().port;
    ad.updateTXT(config);
})