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
module.exports = (Bus) => {
    const ad = new dnssd.Advertisement(dnssd.tcp('rebase-server'), 3000, {
        host: generateId(8),
        txt: {
        }
    });

    ad.start();

    const browser = dnssd.Browser(dnssd.tcp('rebase-client'))
        .on('serviceUp', service => {
            Bus.emit('client:connected', service)
            ad.updateTXT({
                ...ad.txt,
                [service.name]: service.addresses[0] + ':' + service.port
            })
        })
        .on('serviceChange', (service) => {
            Bus.emit('client:updated', service)
            ad.updateTXT({
                ...ad.txt,
                [service.name]: service.addresses[0] + ':' + service.port
            })

        })
        .on('serviceDown', service => {
            Bus.emit('client:disconnected', service)
        });

    browser.start();
    return browser;
}