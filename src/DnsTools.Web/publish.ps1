$ErrorActionPreference = "Stop"

# Checks that the last ran command returned with an exit code of 0
function Assert-LastExitCode {
	if ($LASTEXITCODE -ne 0) {
	  throw 'Non-zero exit code encountered'
	}
}

cd ClientApp
yarn install --frozen-lockfile; Assert-LastExitCode
$Env:SENTRY_RELEASE = .\node_modules\.bin\sentry-cli releases propose-version; Assert-LastExitCode
yarn run build; Assert-LastExitCode
yarn run generate-cshtml; Assert-LastExitCode
cd ..

cd legacy
composer install --apcu-autoloader; Assert-LastExitCode
cd ..

dotnet publish --no-self-contained -r linux-x64 -c Release; Assert-LastExitCode

$choices = '&No', '&Staging', '&Prod';
$choice = $Host.UI.PromptForChoice('Deploy?', '', $choices, 0)
switch ($choice) {
	0 { Exit }
	1 { $remoteDir = "dnstools-staging" }
	2 { $remoteDir = "dnstools" }
}

wsl.exe rsync -av --progress ./bin/Release/net5.0/linux-x64/publish/ dnstools-deploy@d.sb:/var/www/$remoteDir/
