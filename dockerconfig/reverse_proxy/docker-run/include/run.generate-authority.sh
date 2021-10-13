#!/bin/bash

#genero autorità di certificazione se necessario
if [ -f /dockerconfig/cert/authority/RootCA.crt ]; then
  echo "Autorita' gia' presente"
else
  echo -e "Necessario generare nuova autorita'\n"
  rm -rf /dockerconfig/cert/authority/
  mkdir /dockerconfig/cert/authority
  cd /dockerconfig/cert/authority/
  openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout RootCA.key -out RootCA.pem -subj "/C=IT/CN=maxeoDEV"
  openssl x509 -outform pem -in RootCA.pem -out RootCA.crt
  rm -rf /dockerconfig/cert/local/
  mkdir /dockerconfig/cert/local/
  cd /dockerconfig/cert/local/
  echo -e "authorityKeyIdentifier=keyid,issuer\nbasicConstraints=CA:FALSE\nkeyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment\nsubjectAltName = @alt_names\n[alt_names]\nDNS.1 = localhost\nDNS.2 = local.docker">domains.ext
  openssl req -new -nodes -newkey rsa:2048 -keyout localhost.key -out localhost.csr -subj "/C=IT/ST=Italy/L=Florence/O=localwebsite/CN=localhost.local"
  openssl x509 -req -sha256 -days 1024 -in localhost.csr -CA ../authority/RootCA.pem -CAkey ../authority/RootCA.key -CAcreateserial -extfile domains.ext -out localhost.crt
  echo -e "Nuova autorita' generata\n"
fi

