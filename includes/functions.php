<?php
//error_reporting(E_ALL);
// Remove this once all the deprecated junk is cleaned up.
error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
set_include_path(get_include_path() . PATH_SEPARATOR . __DIR__);

require '../vendor/autoload.php';

function get_root_servers()
{
  return [
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
  ];
}

// Format a DNS answer.
function format_answer($answer)
{
  // What type of record is this?
  switch ($answer->type) {
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
    case 'TXT':
      return htmlspecialchars(implode("\n", $answer->text));
    default:
      print_r($answer);
      break;
  }
}

function clean_hostname($hostname)
{
  return preg_replace('/[^A-Za-z0-9.\-]/', '', $hostname);
}

?>
