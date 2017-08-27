<?php
session_start();
require '../includes/functions.php';

if (empty($_POST['host']))
	die();

// Get rid of bad characters.
$_POST['host'] = clean_hostname($_POST['host']);

$page['title'] = 'WHOIS for ' . $_POST['host'];
include '../includes/header.php';

// Check the CAPTCHA.
$errors = null;
if (empty($_SESSION['passed_captcha'])) {
	$recaptcha = new \ReCaptcha\ReCaptcha('6LfMTy4UAAAAAAdUR_HWr8vZSACuVnh3O6HUavRU');
	$remote_ip = empty($_SERVER['HTTP_CF_CONNECTING_IP'])
		? $_SERVER['REMOTE_ADDR']
		: $_SERVER['HTTP_CF_CONNECTING_IP'];
	$captcha_response = empty($_POST['g-recaptcha-response'])
		? ''
		: $_POST['g-recaptcha-response'];
	$response = $recaptcha->verify($captcha_response, $remote_ip);

	if (!$response->isSuccess()) {
		$errors =
			'<div class="alert alert-danger" role="alert">'.
			'Error: The CAPTCHA was entered incorrectly. Please try again. '.
			implode(', ', $response->getErrorCodes()).
			'</div>';
	}
}

if ($errors === null) {
	$_SESSION['passed_captcha'] = true;
}

echo '<form method="post" action="/whois">';
require '../includes/whois_form.php';
echo '</form>';

if ($errors !== null) {
	echo $errors;
} else {
	echo '
	<pre>';
	// Run the whois.
	system('whois -H ' . $_POST['host']);
	echo '
	</pre>';
}

include '../includes/footer.php';
?>
