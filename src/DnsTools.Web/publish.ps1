$ErrorActionPreference = "Stop"

# Checks that the last ran command returned with an exit code of 0
function Assert-LastExitCode {
	if ($LASTEXITCODE -ne 0) {
	  throw 'Non-zero exit code encountered'
	}
}

cd ClientApp
yarn install --frozen-lockfile; Assert-LastExitCode
yarn run build; Assert-LastExitCode
yarn run generate-cshtml; Assert-LastExitCode
cd ..

cd legacy
composer install --apcu-autoloader; Assert-LastExitCode
cd ..

dotnet publish --no-self-contained -r linux-x64 -c Release; Assert-LastExitCode
