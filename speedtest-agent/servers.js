'use strict';

const debug = require('debug')('speedtest-agent:servers');
const fs = require('fs');

const _serverPath = '/etc/speedtest-agent/servers.json';

// Default servers
let _serverList = [
    // { city: 'San Francisco, CA', id: 18531, distance: 683, company: 'Wave' },
    // { city: 'Port Orchard, WA', id: 18532, distance: 29, company: 'Wave' },
    // { city: 'Seattle, WA', id: 8864, distance: 14, company: 'CenturyLink' }
];

function readConfig() {
    try {
        debug(`reading config from: ${_serverPath}`);
        const serversFile = fs.readFileSync(_serverPath, { encoding: 'utf-8' });
        const servers = JSON.parse(serversFile);
        _serverList = servers;
    }
    catch (e) {
        // This isn't logged as an error as we could hit this during
        // build, unit testing, etc
        debug('error loading servers: %O', e);
    }
    debug('test servers: %O', _serverList);
}

module.exports.list = _serverList;

module.exports.init = function init() {
    // Reread the config every five minutes
    setInterval(() => {
        debug('reloading servers');
        readConfig();
    }, 1000 * 60 * 5);
    // Read the initial config
    readConfig();
};