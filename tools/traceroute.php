<?php
require '../includes/functions.php';

if (empty($_GET['host']))
	die();
	
// Get rid of bad characters.
$_GET['host'] = clean_hostname($_GET['host']);

$page['title'] = 'Traceroute to ' . $_GET['host'];
include '../includes/header.php';

echo '
	<form method="get" action="traceroute.php">
		<label>Host: <input type="text" name="host" value="', $_GET['host'], '" /></label>
		<input value="Traceroute" type="submit" />
	</form>	
	
	<pre>';
// Run the trace route.
system('traceroute ' . $_GET['host']);
//system('tracepath ' . $_GET['host']);
echo '
	</pre>';

include '../includes/footer.php';
?>
