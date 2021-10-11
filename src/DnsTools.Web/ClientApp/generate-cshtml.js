/**
 * Generates .cshtml files from the create-react-app and react-snap .html output
 */

const fs = require('fs');

function convertPage(inputFile, outputFile) {
  let inputPage = fs.readFileSync(`${__dirname}/${inputFile}.html`, {
    encoding: 'utf-8',
  });
  let outputPage = `
@{
  Layout = null;
}`;

  if (outputFile === '200') {
    // Replace <title> tag with server-rendered version
    outputPage += `
@model DnsTools.Web.ViewModels.IndexViewModel
`;
    inputPage = inputPage.replace(/<title>([^<]+)/, '<title>@Model.Title');
  }

  outputPage += '\n' + inputPage;

  const outputPath = `${__dirname}/../Views/React/${outputFile}.cshtml`;
  fs.writeFileSync(outputPath, outputPage);
  console.log(`Updated ${outputPath}`);
}

if (fs.existsSync(`${__dirname}/build`)) {
  console.log('*** PROD build');
  convertPage('build/200', '200');
  convertPage('build/404', '404');
  convertPage('build/index', 'Index');
  convertPage('build/locations/index', 'Locations');
} else {
  console.log('*** DEV build');
  convertPage('public/index', '200');
}
