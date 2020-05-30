'use strict';

const debug = require('debug')('speedtest-agent');
const os = require('os');
const speedtest = require('speedtest-net');
const Influx = require('influx');
const servers = require('./servers');

// Minimum interval = 5M
let _interval = 1000 * 60 * 5;
if (process.env.INTERVAL) {
    debug('INTERVAL found in environment variable');
    let interval = parseInt(process.env.INTERVAl);
    if (interval > _interval) {
        _interval = interval;
    }
    else {
        console.error(`Interval of ${interval} ms below minimum threshold of ${_interval} ms`);
    }
}
debug(`using interval of ${_interval} ms`);

const _hostname = os.hostname();
debug(`using hostname: ${_hostname}`);

// Read the list of servers and start config refresh
servers.init();

const influx = new Influx.InfluxDB({
    host: process.env.INFLUXDB_HOST,
    database: process.env.INFLUXDB_DB,
    username: process.env.INFLUXDB_USER,
    password: process.env.INFLUXDB_USER_PASSWORD,
    schema: [
        {
            measurement: 'internet_speed',
            fields: {
                jitter: Influx.FieldType.FLOAT,
                latency: Influx.FieldType.FLOAT,
                download_bandwidth: Influx.FieldType.INTEGER,
                download_bytes: Influx.FieldType.INTEGER,
                upload_bandwidth: Influx.FieldType.INTEGER,
                upload_bytes: Influx.FieldType.INTEGER,
                packet_loss: Influx.FieldType.INTEGER
            },
            tags: [
                'host',
                'server',
                'company'
            ]
        }
    ]
})


async function testServer(serverId) {
    try {
        const config = {
            acceptLicense: true
        };

        if (serverId) {
            config.serverId = serverId;
        }

        const measurements = await speedtest(config);
        debug(`Measurements: ${JSON.stringify(measurements)}`);
        await influx.writePoints([
            {
                measurement: 'internet_speed',
                tags: {
                    host: _hostname,
                    server: measurements.server.location,
                    company: measurements.server.name
                },
                fields: {
                    jitter: measurements.ping.jitter,
                    latency: measurements.ping.latency,
                    download_bandwidth: measurements.download.bandwidth * 8,
                    download_bytes: measurements.download.bytes,
                    upload_bandwidth: measurements.upload.bandwidth * 8,
                    upload_bytes: measurements.upload.bytes,
                    packet_loss: measurements.packetLoss
                }
            }
        ]);
    }
    catch (e) {
        console.error(`Error testing ${serverId}`, e);
    }
}

debug(`Starting interval: ${_interval / 1000} seconds`);

async function testServerList() {
    try {
        debug('Starting server list test');
        for await (const server of servers.list) {
            debug(`Starting ${server.city} (${server.distance} mi)`);
            await testServer(server.id);
            debug(`Ending ${server.city} (${server.distance} mi)`);
        }
        debug('Ending server list test');
    }
    catch (e) {
        console.error('Server list error: ', e);
    }
}

async function testDefaultServer() {
    try {
        debug('Starting default server');
        await testServer();
        debug('Ending default server');
    }
    catch (e) {
        console.error('Default server error: ', e)
    }
}

async function test() {
    if (servers.list.length === 0) {
        await testDefaultServer();
    }
    else {
        await testServerList();
    }
}

setInterval(test, _interval);
test();
