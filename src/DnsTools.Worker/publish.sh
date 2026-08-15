#!/bin/sh

set -ex

worker_dir="$(cd "$(dirname "$0")" && pwd)"

dotnet publish "$worker_dir" -r linux-x64 -c Release
dotnet publish "$worker_dir" -r linux-musl-x64 -c Release /p:CppCompilerAndLinker=musl-gcc
