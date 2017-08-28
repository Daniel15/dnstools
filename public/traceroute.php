<?php
require '../includes/functions.php';

if (empty($_GET['host']))
  die();

// Get rid of bad characters.
$_GET['host'] = clean_hostname($_GET['host']);

$page['title'] = 'Traceroute to ' . $_GET['host'];
include '../includes/header.php';

echo '
	<form method="get" action="/traceroute" data-tool-url="/traceroute/{host}/" class="form-inline mb-3">
		<div class="form-group">
			<label for="host" class="col-2">Host:</label>
			<input type="text" class="form-control col-10" name="host" id="host" value="', $_GET['host'], '" />
		</div>
		<input value="Traceroute" type="submit" class="btn btn-primary ml-2" />
	</form>

	<pre>';
// Run the trace route.
system('traceroute ' . $_GET['host']);
//system('tracepath ' . $_GET['host']);
echo '
	</pre>';

include '../includes/footer.php';
?>
