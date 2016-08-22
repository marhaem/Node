#How to generate certificates for openvpn:
```bash
cd /etc/openvpn/easy-rsa/easy-rsa
cp openssl-x.x.x.cnf openssl.cnf
source ./vars
./clean-all
./build-ca
./build-key-server <server-name>
./build-key <user-name>
./build-dh
```

Copy keys into where openvpn can find them:
```bash
cp {ca.crt,server.crt,server.key,dh2048.pem} /usr/share/easy-rsa/keys/
cp -r /etc/openvpn/easy-rsa/easy-rsa/keys /usr/share/easy-rsa/
```

#Usefull commands
```bash
/etc/letsencrypt/options-ssl-apache.conf

# show all groups
cut -d: -f1 /etc/group
id -u username
id username

# add new user to groups
useradd -G developers jerry

# add existing user to group
usermod -a -G ftp tony

# remove files/folders traceless
wipe -q -Q 1 -R /dev/zero -S r -r $PFAD
```

#iptables DNS-rules
```bash
-A OUTPUT -p udp -d 208.67.222.222,208.67.220.220,8.8.8.8 --dport 53 -m state --state NEW,ESTABLISHED -j ACCEPT
-A OUTPUT -p tcp -d 208.67.222.222,208.67.220.220,8.8.8.8 --dport 53 -m state --state NEW,ESTABLISHED -j ACCEPT
```

#how to disable ipv6 for apt-get
```bash
echo "net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1 
net.ipv6.conf.lo.disable_ipv6 = 1 " >> /etc/sysctl.conf
cat /proc/sys/net/ipv6/conf/all/disable_ipv6
# output should be 1
# if output is 0
sysctl -p
# now again
cat /proc/sys/net/ipv6/conf/all/disable_ipv6
```

#Force apt-get to use ipv4 exclusively
```bash
touch /etc/apt/apt.conf.d/99force-ipv4
echo "Acquire::ForceIPv4 false;" | tee /etc/apt/apt.conf.d/99force-ipv4
```

```bash
nslookup http://archive.ubuntu.com/
ping http://archive.ubuntu.com/
host -v us.archive.ubuntu.com
```

#Change dns
```bash
nano /etc/resolv.conf
```
echo "nameserver 8.8.8.8
nameserver 8.8.4.4" >> /etc/resolv.conf

#changed /etc/hosts
```bash
91.189.88.152   archive.ubuntu.com
```