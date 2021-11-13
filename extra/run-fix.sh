#!/bin/bash

dos2unix ../dockerconfig/reverse_proxy/docker-run/run.sh
dos2unix ../dockerconfig/webserver/docker-run/run.sh

chmod +x ../dockerconfig/reverse_proxy/docker-run/run.sh
chmod +x ../dockerconfig/webserver/docker-run/run.sh