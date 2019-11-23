<?php
require '../functions.php';

if (empty($_GET['host']) || empty($_GET['type']))
  die();
// Get rid of bad characters.
$_GET['host'] = clean_hostname($_GET['host']);

$server_ips = [];
// Do the lookup.
do_lookup(get_root_servers());

function do_lookup($servers)
{
  global $server_ips;

  echo 'Looking on ', count($servers), ' servers:
	<table class="table table-striped">
		<thead>
			<tr>
				<th>Server</th>
				<th>Response</th>
				<th>Time</th>
			</tr>
		</thead>
		<tbody>';
  $name_servers = array();

  // Loop through each server
  foreach ($servers as $server) {
    if (!array_key_exists($server, $server_ips)) {
      $server_ips[$server] = gethostbyname($server);
    }

    $resolver = new Net_DNS2_Resolver([
      'nameservers' => [$server_ips[$server]],
    ]);
    $start_time = microtime(true);
    $response = null;
    $error = null;
    try {
      $response = $resolver->query($_GET['host'], $_GET['type']);
    } catch (Net_DNS2_Exception $e) {
      $error = $e;
    }
    $time = number_format((microtime(true) - $start_time) * 1000, 2) . ' ms';

    if ($error !== null) {
      echo '
			<tr>
				<td>', $server, '</td>
				<td>Failed: ', $error->getMessage(), '</td>
				<td>', $time, '</td>
			</tr>';
    } else {
      // Was this server non-authoritive?
      if ($response->header->ancount == 0) {
        // Let's get a list of the new servers to check.
        $name_servers_temp = array();
        // Loop through all of them.
        foreach ($response->authority as $authority) {
          // Add this one to the list.
          $name_servers_temp[] = strtolower($authority->nsdname);
        }
        // Sort them.
        asort($name_servers_temp);
        // Add them to the overall list.
        $name_servers = array_unique(array_merge($name_servers, $name_servers_temp));

        // Add any IPs passed as glue records
        foreach ($response->additional as $additional) {
          if ($additional->type === 'A') {
            $server_ips[$additional->name] = $additional->address;
          }
        }

        echo '
			<tr>
				<td>', $server, '</td>
				<td>', implode(', ', $name_servers_temp), '</td>
				<td>', $time, '</td>
			</tr>';

      } // Authoritive, you say?
      else {
        $answers = array();
        foreach ($response->answer as $answer) {
          //$answers[] = $answer->address;
          $answers[] = format_answer($answer);
        }
        asort($answers);

        echo '
			<tr>
				<td>', $server, '</td>
				<td>', implode(', ', $answers), '</td>
				<td>', $time, '</td>
			</tr>';

      }
    }

  }

  echo '
		<tbody>
	</table><br />';

  // If it was not authoritive, we need to do another look.
  //if ($response->header->ancount == 0)
  if (count($name_servers) != 0) {
    do_lookup($name_servers);
  }
}
