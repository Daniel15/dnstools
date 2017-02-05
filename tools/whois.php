<?php
require '../includes/functions.php';
include '../includes/3rdparty/php-captcha.inc.php';

if (empty($_POST['host']))
	die();

// Get rid of bad characters.
$_POST['host'] = clean_hostname($_POST['host']);

$page['title'] = 'WHOIS for ' . $_POST['host'];
include '../includes/header.php';

echo '
	<form method="post" action="whois.php">
		<label>Host: <input type="text" name="host" value="', $_POST['host'], '" /></label><br />
		<img src="../captcha.php" width="200" height="60" alt="Verification Code" /><br />
		<input type="text" name="code" id="code" />
		<p style="font-size: x-small">Please enter the code to prove you\'re not a bot.</p>
		<input value="Lookup" type="submit" />
	</form>';

// Check the CAPTCHA.
if (!(PhpCaptcha::Validate($_POST['code'])))
{
	echo '<p class="error">Error: The visual verification code was entered incorrectly. Please try again.</p>';
}
else
{	
	echo '	
	<pre>';
	// Run the whois.
	system('whois -H ' . $_POST['host']);
	echo '
	</pre>';
}

include '../includes/footer.php';
?>
