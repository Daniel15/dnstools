#!/bin/sh
set -ex

script_dir="$(cd "$(dirname "$0")" && pwd)"
repo_dir="$(cd "$script_dir/.." && pwd)"

if [ ! -d "$repo_dir/src/DnsTools.Worker/bin/Release/net8.0/linux-x64/publish/" ]; then
	"$repo_dir/src/DnsTools.Worker/publish.sh"
fi

ANSIBLE_CONFIG="$script_dir/ansible.cfg" ansible-playbook "$script_dir/worker.yml" --extra-vars "@$script_dir/passwd.yml" --vault-password-file="$script_dir/vault-password"
