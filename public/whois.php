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
	<form method="post" action="/whois" class="mb-3 col-3">
		<div class="form-group row">
			<label for="whois-host" class="col-2 col-form-label">Host:</label>
			<div class="col-10">
				<input class="form-control" type="text" name="host" id="whois-host"  value="', $_POST['host'], '" />
			</div>
		</div>

		<img src="../captcha.php" width="200" height="60" alt="Verification Code" /><br />
		<input class="form-control" type="text" name="code" id="code" />
		<p style="font-size: x-small">Please enter the code to prove you\'re not a bot.</p>

		<input value="Lookup" type="submit" class="btn btn-primary" />
	</form>';

// Check the CAPTCHA.
if (!(PhpCaptcha::Validate($_POST['code'])))
{
	echo '<div class="alert alert-danger" role="alert">Error: The visual verification code was entered incorrectly. Please try again.</div>';
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
