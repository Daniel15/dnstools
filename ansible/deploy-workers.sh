#!/bin/bash
set -ex
if [ ! -d ../src/DnsTools.Worker/bin/Release/net5.0/linux-x64/publish/ ]; then
	dotnet.exe publish ../src/DnsTools.Worker --no-self-contained -r linux-x64 -c Release
fi
ansible-playbook worker.yml --extra-vars '@passwd.yml' --vault-password-file=vault-password
