<?php
require '../includes/functions.php';

if (empty($_GET['host']))
	die();
	
// Get rid of bad characters.
$_GET['host'] = clean_hostname($_GET['host']);

$page['title'] = 'Ping ' . $_GET['host'];
include '../includes/header.php';

echo '
	<form method="get" action="ping.php">
		<label>Host: <input type="text" name="host" value="', $_GET['host'], '" /></label>
		<input value="Ping" type="submit" />
	</form>	
	
	<pre>';
// Run the ping.
system('ping -c 5 ' . $_GET['host']);
echo '
	</pre>';

include '../includes/footer.php';
?>
