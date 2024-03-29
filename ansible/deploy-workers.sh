#!/bin/bash
set -ex
if [ ! -d ../src/DnsTools.Worker/bin/Release/net8.0/linux-x64/publish/ ]; then
	dotnet publish ../src/DnsTools.Worker -r linux-x64 -c Release
fi

ANSIBLE_CONFIG=/mnt/c/src/dnstools.ws/ansible/ansible.cfg ansible-playbook worker.yml --extra-vars '@passwd.yml' --vault-password-file=vault-password
