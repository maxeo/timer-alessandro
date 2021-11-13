#!/bin/bash

tail -f /var/log/apache2/access.log & tail -f /var/log/apache2/error.log
