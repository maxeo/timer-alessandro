FROM debian:stretch

RUN apt-get update \
  && apt-get install -y apache2

RUN a2enmod rewrite && a2enmod ssl && a2enmod proxy && a2enmod proxy_http && a2enmod proxy_balancer && a2enmod lbmethod_byrequests


ENTRYPOINT ["/docker-run/run.sh"]