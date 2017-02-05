<?php
require '../includes/functions.php';

if (empty($_GET['host']) || empty($_GET['type']))
	die();
// Get rid of bad characters.
$_GET['host'] = clean_hostname($_GET['host']);

$page['title'] = 'DNS Traversal for ' . $_GET['host'];
include '../includes/header.php';

// Do the lookup.
do_lookup($root_servers);

//function do_lookup($domain, &$servers)
function do_lookup($servers)
{
	global $resolver;
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
	foreach ($servers as $server)
	{
		// Set the name servers.
		$resolver->nameservers = array($server);
		// Save the start time
		$start_time = microtime(true);
		// Do this lookup.
		$response = $resolver->rawQuery($_GET['host'], $_GET['type']);
		// Get the end time
		$time = number_format((microtime(true) - $start_time) * 1000, 2) . ' ms';

		// Did the query fail?
		if ($response->header->rcode != 'NOERROR')
		{
			echo '
			<tr>
				<td>', $response->answerfrom, '</td>
				<td>Failed: ', $response->header->rcode, '</td>
				<td>', $time, '</td>
			</tr>';
		}
		else
		{
			// Was this server non-authoritive?
			if ($response->header->ancount == 0)
			{
				// Let's get a list of the new servers to check.
				$name_servers_temp = array();
				// Loop through all of them.
				foreach ($response->authority as $authority)
				{
					// Add this one to the list.
					$name_servers_temp[] = strtolower($authority->nsdname);
				}
				// Sort them.
				asort($name_servers_temp);
				// Add them to the overall list.
				$name_servers = array_unique(array_merge($name_servers, $name_servers_temp));

				echo '
			<tr>
				<td>', $response->answerfrom, '</td>
				<td>', implode(', ', $name_servers_temp), '</td>
				<td>', $time, '</td>
			</tr>';

			}
			// Authoritive, you say?
			else
			{
				$answers = array();
				foreach ($response->answer as $answer)
				{
					//$answers[] = $answer->address;
					$answers[] = format_answer($answer);
				}
				asort($answers);

				echo '
			<tr>
				<td>', $response->answerfrom, '</td>
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
	if (count($name_servers) != 0)
	{
		do_lookup($name_servers);
	}
}

include('../includes/footer.php');
?>
