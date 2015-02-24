#!/bin/bash

service nginx start

container_address=$(/sbin/ifconfig eth0 | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1}')
host_address=$(/sbin/ip route|awk '/default/ { print $3 }')
echo $internet_address

curl -L -X PUT http://$host_address:4001/v2/keys/circusoc -d value="$container_address"


cd /root
java -jar /root/backend.jar
#python -m SimpleHTTPServer
