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

const _defaultServers = [
    { city: 'San Francisco, CA', id: 18531, distance: 683, company: 'Wave' },
    { city: 'Port Orchard, WA', id: 18532, distance: 29, company: 'Wave' },
    { city: 'Seattle, WA', id: 8864, distance: 14, company: 'CenturyLink' }
    //{ City: 'Woodburn, OR', id: 18533, distance: 177 }
]

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

console.log(`Starting interval: ${_interval / 1000} seconds`);

async function performTest() {
    try {
        debug('Starting test');
        for await (const server of servers.list) {
            try {
                debug(`Starting ${server.city} (${server.distance} mi)`);
                const measurements = await speedtest({ acceptLicense: true, serverId: server.id });
                debug(`Measurements: ${JSON.stringify(measurements)}`);
                await influx.writePoints([
                    {
                        measurement: 'internet_speed',
                        tags: {
                            host: _hostname,
                            server: server.city,
                            company: server.company
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
                debug(`Ending ${server.city} (${server.distance} mi)`);
            }
            catch (e) {
                console.error(`Ending ${server.city}(${server.distance} mi)`, e);
            }
        }
        debug('Test finished');
    }
    catch (err) {
        console.error('Test error: ', err);
    }
}

setInterval(performTest, _interval);
performTest();
