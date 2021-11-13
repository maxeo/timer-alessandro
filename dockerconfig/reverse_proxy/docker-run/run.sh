#!/bin/bash

bash /docker-run/include/run.generate-authority.sh
php /docker-run/include/run.config-env.php
bash /docker-run/include/run.restart.sh
bash /docker-run/include/run.log.sh
