# Raspberry Pi Speedtest

I was looking for a way to monitor my ISP over time to see how my connection was performing.

I had used speedtest-cli to gather stats in the past but wanted to graph them.  

This project combines speedtest-cli for testing with influxdb to store the time series data, grafana to provide a dashboard of the data and k3s to provide a deployment platform on the Raspberry PI.

> NOTE: If you have a 100Mbps or more connection you need a Raspberry Pi 4 or later to run the tests.  The Raspberry Pi 3 Model B+ or lower the network is connected over the USB 2.0 bus which limits the speed.  In my testing the Pi 3 tops out at about 100Mbps. 

## Quick Start

1. Install Raspbian Lite onto your Raspberry Pi.  Make sure you setup SSH access via an RSA key.
2. Install k3s.  Easy instructions for installing k3s using k3sup are here: [k3sup]
(https://github.com/alexellis/k3sup).
3. Make sure kubectl is configured - Run kubectl get pods to test.
4. kubectl create namespace speedtest - Manual step since helm3 has issues with the --namespace flag and creating the namespace
5. helm install speedtest . --set influxdb.password=<XXXXX> --set grafana.hostname=<hostname>.local --namespace speedtest
6. Log into grafana at http://<hostname>.local, user: admin, password: admin
7. Change grafana password
8. Add influxdb as a data source - The notes.txt includes the connection info
9. Import the dashboard.json file in the root for a starting point

If you already have an influxdb / grafana installation feel free to just use the speedtest-agent container to funnel stats to your install.

## Agent only

If you want to run just the agent and send the output to an existing InfluxDb / Grafana installation specify the influxdb.host and influxdb.password at a minimum.  Optionally you can also specify influxdb.user and influxdb.db.

helm install speedtestpi3 . --set influxdb.password=<xxxxx> --set influxdb.host=speedtestpi4.local

## Custom list of servers

See [servers.json](servers.json) for an example of how to specify a custom list of servers.  To get the server id download speedtest-cli and run speedtest-cli --list.

helm install speedtestpi3 . --set influxdb.password=<xxxxx> --set influxdb.host=<hostname> --set-file serverList=../../servers.json 

