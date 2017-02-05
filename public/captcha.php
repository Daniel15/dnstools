<?php
require('../includes/3rdparty/php-captcha.inc.php');
//$aFonts = array('fonts/acidic.ttf', 'fonts/borduu.ttf', 'fonts/cbgb.ttf', 'fonts/corporeaa.ttf', /*'fonts/dymo.ttf', */'fonts/fanzine.ttf', 'fonts/jaii.ttf', 'fonts/kulminoituva.ttf');
$aFonts = array(__DIR__.'/../includes/3rdparty/fonts/Vera.ttf', __DIR__.'/../includes/3rdparty/fonts/VeraBd.ttf', __DIR__.'/../includes/3rdparty/fonts/VeraIt.ttf');
$oPhpCaptcha = new PhpCaptcha($aFonts, 200, 60);
$oPhpCaptcha->UseColour(false);
$oPhpCaptcha->DisplayShadow(false);
$oPhpCaptcha->SetNumLines(50);
$oPhpCaptcha->Create();
?>
