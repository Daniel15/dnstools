<?php
// Redirects from legacy URLs (/tools/foo.php?host=example.com) to modern URLs
// (/foo/example.com/)
$legacy_url = parse_url($_SERVER['REQUEST_URI']);
parse_str($legacy_url['query'], $querystring);

$url = str_replace(array('tools/', '.php'), '', $legacy_url['path']);
$url .= '/'.$querystring['host'];
if (!empty($querystring['type'])) {
  $url .= '/'.$querystring['type'];
}
$url .= '/';

header('HTTP/1.1 301 Moved Permanently');
header('Location: '.$url);
