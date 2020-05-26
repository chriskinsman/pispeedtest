# Raspberry Pi Speedtest

I was looking for a way to monitor my ISP over time to see how my connection was performing.

I had used speedtest-cli to gather stats in the past but wanted to graph them.  

This project combines speedtest-cli for testing with influxdb to store the time series data, grafana to provide a dashboard of the data and k3s to provide a deployment platform on the Raspberry PI.

## Quick Start

1. Install Raspbian Lite onto your Raspberry Pi.  Make sure you setup SSH access via an RSA key.
2. Install k3s.  Easy instructions for installing k3s using k3sup are here: [k3sup]
(https://github.com/alexellis/k3sup]).
3. Make sure kubectl is configured
4. helm install speedtestpi4 . --set influxdb.password=<XXXXX> --namespace speedtest
5. Log into grafana at http://<hostname>, user: admin, password: admin
6. Change grafana password
6. Add influxdb as a data source
7. Import the dashboard.json file in the root for a starting point

If you already have an influxdb / grafana installation feel free to just use the speedtest-agent container to funnel stats to your install.