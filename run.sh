#!/bin/bash

service nginx start

cd /root
java -jar /root/backend.jar
#python -m SimpleHTTPServer
