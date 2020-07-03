# dnstools.ws

This is the source code for [dnstools.ws](https://dnstools.ws).

# Architecture

DNSTools is split into two pieces:

## Website

The website is a C# ASP .NET Core 3.0 website, built using React and SignalR.

## Worker

The "worker" (or "agent") is a small app that runs on multiple servers around the world. It's a [gRPC](https://grpc.io/) service written in C# using .NET Core 3.0. In production, the workers are a mix of KVM and OpenVZ7 VPSes running Debian Buster (10).

Some workers (such as pings and traceroutes) use the standard `ping` and `traceroute` command-line utilities. Pings can only be sent by root, and reusing existing well-tested code is more secure than creating our own setuid binaries. Other tools (like DNS lookups) are all performed using C# code.

# Development

The `DnsTools.sln` VS2019 solution contains both the website and the worker.

## Website

The website consists of two parts: A frontend app built using Create React App, and a backend app built using C#. To run the development version of the website, you need to start both:

- Frontend: Run `yarn start` in the `src/DnsTools.Web/ClientApp` directory
- Backend: Run `DnsTools.Web` from Visual Studio, or via `dotnet run` at the command-line

You can then hit the site at `http://localhost:31429/`. The C# backend is running on `https://localhost:5001/` but this is only used for API requests - All webpages are loaded via the Webpack dev server.

## Worker

The worker requires a few Linux utilities (like `ping` and `traceroute`) to be available. On Windows, you can run the worker using Docker. VS2019's built-in Docker support is sufficient for this - Just start the project in Visual Studio and it'll automatically spin up the Docker container.

# Deploying to Production

## Website

Build the site using the `publish` script:

```sh
cd src/DnsTools.web
./publish
```

`rsync` it to prod:

```sh
rsync -avz --progress src/DnsTools.Web/bin/release/netcoreapp3.1/linux-x64/publish/ dnstools-deploy@dnstools.ws:/var/www/dnstools/
```

## Workers

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

Create a TLS certificate for the worker:

```sh
sudo certbot certonly --manual --manual-auth-hook /etc/letsencrypt/acme-dns-auth.py --preferred-challenges dns --debug-challenges --server https://acme-v02.api.letsencrypt.org/directory --cert-name dnstools-worker -d xx.worker.dns.tg
```

(where `xx` is some identifier for the worker, like `fr` for France or `us-ny` for New York)
