limit gpu to 16M
change password
change hostname
ssh-copy-id -i ~/.ssh/id_rsa.pub pi@speedtest.local
sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
sudo systemctl disable dphys-swapfile.service
cgroup_enable=cpuset cgroup_memory=1 cgroup_enable=memory
k3sup install --ip $SERVER --user pi
Copy the config into your ~/.kube/config
kubectl apply -f install.yml


References:
* https://blog.alexellis.io/test-drive-k3s-on-raspberry-pi/
* https://github.com/bbruun/k3s-getting-started
* https://github.com/bbruun/k3s-getting-started/blob/master/README-volumes.md