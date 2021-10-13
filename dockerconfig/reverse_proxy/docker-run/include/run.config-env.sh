#!/bin/bash


cd /etc/apache2/sites-available

rm -f 000-default.conf
cp 000-default.conf.original 000-default.conf

sed -i "s/{RP_PORT_FROM}/$RP_PORT_FROM/" 000-default.conf
sed -i "s/{RP_PORT_FROM_SSL}/$RP_PORT_FROM_SSL/" 000-default.conf
sed -i "s/{RP_PORT_PROXY}/$RP_PORT_PROXY/" 000-default.conf
