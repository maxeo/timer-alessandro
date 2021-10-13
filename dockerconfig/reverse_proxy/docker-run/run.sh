#!/bin/bash


bash /docker-run/include/run.generate-authority.sh
bash /docker-run/include/run.config-env.sh
bash /docker-run/include/run.restart.sh
bash /docker-run/include/run.log.sh
