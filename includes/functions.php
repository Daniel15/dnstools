<?php
//error_reporting(E_ALL);
// Remove this once all the deprecated junk is cleaned up.
error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
set_include_path(get_include_path() . PATH_SEPARATOR . __DIR__);
require __DIR__ . '/../vendor/autoload.php';

require_once 'Net/DNS.php';
$resolver = new Net_DNS_Resolver();
//$resolver->debug = 1;

// List of root nameservers.
$root_servers = array(
	/*'198.41.0.4', // a
	'192.228.79.201', // b
	'192.33.4.12', // c
	'128.8.10.90', // d
	'192.203.230.10', // e
	'192.5.5.241', // f
	'192.112.36.4', // g
	'128.63.2.53', // h
	'192.36.148.17', // i
	'192.58.128.30', // j
	'193.0.14.129', // k
	'198.32.64.12', // l
	'202.12.27.33', // m*/

	'a.root-servers.net',
	'b.root-servers.net',
	'c.root-servers.net',
	'd.root-servers.net',
	'e.root-servers.net',
	'f.root-servers.net',
	'g.root-servers.net',
	'h.root-servers.net',
	'i.root-servers.net',
	'j.root-servers.net',
	'k.root-servers.net',
	'l.root-servers.net',
	'm.root-servers.net',
);
// Randomise the order
shuffle($root_servers);

// Format a DNS answer.
function format_answer($answer)
{
	// What type of record is this?
	switch ($answer->type)
	{
		case 'A':
		case 'AAAA':
			return $answer->address;
			break;
		case 'CNAME';
			return $answer->cname;
			break;
		case 'MX':
			return $answer->exchange . ' (priority ' . $answer->preference . ')';
			break;
		case 'NS':
			return $answer->nsdname;
			break;
		case 'PTR':
			return $answer->ptrdname;
			break;
		case 'SOA':
			return '
			Primary DNS server: ' . $answer->mname . '<br />
			Responsible name: ' . $answer->rname . '<br />
			Serial: ' . $answer->serial . '<br />
			Refresh: ' . $answer->refresh . 's<br />
			Retry: ' . $answer->retry . 's<br />
			Expire: ' . $answer->expire . 's<br />
			Minimum TTL: ' . $answer->minimum . 's';
			break;
		default:
			print_r($answer);
			break;
	}
}

function clean_hostname($hostname)
{
	return preg_replace ('/[^A-Za-z0-9.\-]/', '', $hostname);
}
?>
