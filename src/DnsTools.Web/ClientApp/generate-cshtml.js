/**
 * Generates .cshtml files from the create-react-app and react-snap .html output
 */

const fs = require('fs');

function convertPage(inputFile, outputFile) {
  const inputPage = fs.readFileSync(`${__dirname}/${inputFile}.html`, {
    encoding: 'utf-8',
  });
  const outputPage = `
@{
  Layout = null;
}
@model DnsTools.Web.ViewModels.IndexViewModel
${inputPage.replace(/<title>([^<]+)/, '<title>@Model.Title')}`;

  const outputPath = fs.realpathSync(
    `${__dirname}/../Views/React/${outputFile}.cshtml`,
  );
  fs.writeFileSync(outputPath, outputPage);
  console.log(`Updated ${outputPath}`);
}

if (fs.existsSync(`${__dirname}/build`)) {
  console.log('*** PROD build');
  convertPage('build/200', '200');
} else {
  console.log('*** DEV build');
  convertPage('public/index', '200');
}
