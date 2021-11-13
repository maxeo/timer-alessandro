<?php

const DOCKER_CONFIG_DIR = '/docker-run/config';
const WEBSITES_CONFIG_PROXY_FILENAME = 'virtualproxy.original.conf';
const WEBSITES_CONFIG_WEBSITES_FILENAME = 'websites.config.json';
const WEBSITES_CONFIG_PROXY_DIR = DOCKER_CONFIG_DIR . '/' . WEBSITES_CONFIG_PROXY_FILENAME;
const WEBSITES_CONFIG_WEBSITES_DIR = DOCKER_CONFIG_DIR . '/' . WEBSITES_CONFIG_WEBSITES_FILENAME;
const APACHE2_DIR = '/etc/apache2';

$single_target = isset($_SERVER["argv"]) && isset($_SERVER["argv"][1]) ? $_SERVER["argv"][1] : false;


$website_config = json_decode(file_get_contents(WEBSITES_CONFIG_WEBSITES_DIR));
$proxy_base = file_get_contents(WEBSITES_CONFIG_PROXY_DIR);

$sites_enabled_dir = scandir(APACHE2_DIR . "/sites-enabled");

if ($single_target === false) {
    foreach ($sites_enabled_dir as $f_name) {
        if ($f_name !== '.' && $f_name !== '..' && $f_name !== '000-default.conf') {
            if (file_exists(APACHE2_DIR . "/sites-enabled/$f_name")) {
                unlink(APACHE2_DIR . "/sites-enabled/$f_name");
            }
        }
    }

    $sites_available_dir = scandir(APACHE2_DIR . "/sites-available");
    foreach ($sites_available_dir as $f_name) {
        if ($f_name !== '.' && $f_name !== '..' && $f_name !== '000-default.conf') {
            if (file_exists(APACHE2_DIR . "/sites-available/$f_name")) {
                unlink(APACHE2_DIR . "/sites-available/$f_name");
            }
        }
    }
}

foreach ($website_config as $index => $config) {
    if ($single_target === false || $config->domain === $single_target) {


        $use_certbot = property_exists($config, 'certbot') && $config->certbot === true;

        $alias = '';
        foreach ($config->alias as $al) {
            $alias .= "ServerAlias $al\n";
        }


        $extra_conf = property_exists($config, 'extra') ? "\n" . $config->extra : "";
        $https_only = property_exists($config, 'https_only') && $config->https_only === true ? "\nRewriteCond %{HTTPS} off\nRewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI}" : "";

        $ssl_cert_file = "/dockerconfig/cert/local/localhost.crt";
        $ssl_cert_key_file = "/dockerconfig/cert/local/localhost.key";


        $proxy_data = str_replace(
          ['{RP_SERVER_NAME}', '{SEVER_ALIAS}', '{RP_DOMAIN_PROXY}', '{RP_PORT_PROXY}', '{EXTRA_CONF}', '{SSL_CERT_FILE}', '{SSL_CERT_KEY_FILE}', '{HTTPS_REDIRECT}'],
          [$config->domain, $alias, $config->host, $config->port, $extra_conf, $ssl_cert_file, $ssl_cert_key_file, $https_only],
          $proxy_base
        );

        $conf_file_name = "{$config->domain}.docker.conf";

        file_put_contents(APACHE2_DIR . "/sites-available/$conf_file_name",
          $proxy_data
        );
        exec("a2ensite $conf_file_name");

        if ($use_certbot) {

            $expand = count($config->alias) ? '--expand ' : '';

            $domains = [$config->domain];
            if (count($config->alias)) {
                $domains = array_merge($domains, $config->alias);
            }


            echo "certbot certonly $expand--apache --non-interactive --agree-tos -m {$config->certbot_mail} -d " . implode(',', $domains) . "\n";
            exec("certbot certonly $expand--apache --non-interactive --agree-tos -m {$config->certbot_mail} -d " . implode(',', $domains));


            $ssl_cert_file = "/etc/letsencrypt/live/{$config->domain}/fullchain.pem";
            $ssl_cert_key_file = "/etc/letsencrypt/live/{$config->domain}/privkey.pem";

            $proxy_data = str_replace(
              ['{RP_SERVER_NAME}', '{SEVER_ALIAS}', '{RP_DOMAIN_PROXY}', '{RP_PORT_PROXY}', '{EXTRA_CONF}', '{SSL_CERT_FILE}', '{SSL_CERT_KEY_FILE}', '{HTTPS_REDIRECT}'],
              [$config->domain, $alias, $config->host, $config->port, $extra_conf, $ssl_cert_file, $ssl_cert_key_file, $https_only],
              $proxy_base
            );

            file_put_contents(APACHE2_DIR . "/sites-available/$conf_file_name",
              $proxy_data
            );
        }

        if ($config->domain === $single_target) {
            exec("service apache2 reload");
        }
    }
}


//exec("service apache2 restart");
