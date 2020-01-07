# dnstools.ws

This is the source code for [dnstools.ws](https://dnstools.ws).

# Architecture

DNSTools is split into two pieces:

## Website

The website is a C# ASP .NET Core 3.0 website, built using React and SignalR.

## Worker

The "worker" (or "agent") is a small app that runs on multiple servers around the world. It's a [gRPC](https://grpc.io/) service written in C# using .NET Core 3.0. In production, the workers are mix of KVM and OpenVZ7 VPSes running Debian Buster (10).

# Deployment of Workers

The workers are all configured and deployed using [Ansible](https://www.ansible.com/).

Some manual configuration is required before running Ansible:

1. Generate a random password and store it in `./ansible/vault-password`
2. Store servers' `sudo` password in an encrypted Ansible Vault file:

```sh
cd ansible
ansible-vault create passwd.yml
ansible-vault edit passwd.yml --vault-password-file=vault-password
```

In the file, add:

```yml
sudo_pass: put_the_password_here
```

3. Start `ssh-agent` and load the Ansible SSH key:

```sh
eval `ssh-agent`
ssh-add ~/.ssh/id_ed25519_ansible
```

Running the `deploy-workers.sh` script will run the playbook to deploy all the workers. Be sure to publish the worker app first:

```sh
dotnet publish --no-self-contained -r linux-x64 -c Release
```

For new workers, some manual configuration is required after the first time it's deployed using Ansible:

1. Configure WireGuard in `/etc/wireguard/wg0.conf`. All workers need `vps03` as a peer, as it's currently the server hosting the website. Example config:

```ini
[Interface]
Address = 10.123.1.20
PrivateKey = xxxxxx
ListenPort = 38917

# vps03
[Peer]
PublicKey = xxxxxx
AllowedIPs = 10.123.1.1/32
Endpoint = [2605:6400:20:92e::4]:38917

```

2. Create a TLS certificate for the worker:

```sh
sudo certbot certonly --manual --manual-auth-hook /etc/letsencrypt/acme-dns-auth.py --preferred-challenges dns --debug-challenges --server https://acme-v02.api.letsencrypt.org/directory --cert-name dnstools-worker -d xx.worker.dns.tg
```

(where `xx` is some identifier for the worker, like `fr` for France or `us-ny` for New York)
