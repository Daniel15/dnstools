#!/bin/bash
set -ex

cd ClientApp
yarn install --frozen-lockfile
export SENTRY_RELEASE=$(./node_modules/.bin/sentry-cli releases propose-version)
yarn run build
yarn run generate-cshtml
cd ..

dotnet publish --no-self-contained -r linux-x64 -c Release

PS3="Deploy? "
options=("No" "Staging" "Prod")
select opt in "${options[@]}"; do
    case $opt in
        "No")
            echo "Exiting..."
            exit 0
            ;;
        "Staging")
            remoteDir="dnstools-staging"
            break
            ;;
        "Prod")
            remoteDir="dnstools"
            break
            ;;
        *)
            echo "Invalid option $REPLY"
            ;;
    esac
done

rsync -av --progress ./bin/Release/net8.0/linux-x64/publish/ daniel@d.sb:/var/www/$remoteDir/
