<?php
require '../includes/functions.php';

if (empty($_GET['host']))
	die();

// Get rid of bad characters.
$_GET['host'] = clean_hostname($_GET['host']);

$page['title'] = 'Ping ' . $_GET['host'];
include '../includes/header.php';

echo '
	<form method="get" action="/ping" data-tool-url="/ping/{host}/" class="form-inline mb-3">
		<div class="form-group">
			<label for="host" class="col-2">Host:</label>
			<input type="text" class="form-control col-10" name="host" id="host" value="', $_GET['host'], '" />
		</div>
		<input value="Ping" type="submit" class="btn btn-primary ml-2" />
	</form>

	<pre>';
// Run the ping.
system('ping -c 5 ' . $_GET['host']);
echo '
	</pre>';

include '../includes/footer.php';
?>
