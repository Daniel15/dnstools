#!/bin/bash
set -e

# To obtain cert:
# sudo certbot certonly --manual --manual-auth-hook /etc/letsencrypt/acme-dns-auth.py --preferred-challenges dns --debug-challenges --server https://acme-v02.api.letsencrypt.org/directory --cert-name dnstools-worker -d it.worker.dns.tg

openssl pkcs12 -export -out /opt/dnstools-worker/key.pfx -inkey /etc/letsencrypt/live/dnstools-worker/privkey.pem -in /etc/letsencrypt/live/dnstools-worker/cert.pem -certfile /etc/letsencrypt/live/dnstools-worker/chain.pem --password pass:Oxz8FZ7o7aZeGxa2w4wTjs6t7W5DVUCVHJuVDv37WsUvz9uBsv
chown root:www-data /opt/dnstools-worker/key.pfx
chmod 0750 /opt/dnstools-worker/key.pfx

systemctl restart dnstools-worker