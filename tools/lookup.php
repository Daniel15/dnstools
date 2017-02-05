<?php
require '../includes/functions.php';

if (empty($_GET['host']) || empty($_GET['type']))
	die();

if ($_GET['type'] === 'ANY' && !empty($_SERVER['HTTP_REFERER'])) {
	header('Location: https://www.youtube.com/watch?v=dQw4w9WgXcQ');
	die();
}

	
// Get rid of bad characters.
$_GET['host'] = clean_hostname($_GET['host']);

$page['title'] = 'DNS Lookup for ' . $_GET['host'];
include '../includes/header.php';

echo '
	<form method="get" action="lookup.php">
		<label>Host: <input type="text" name="host" value="', $_GET['host'], '" /></label>
		<label for="type">Type: </label>
		<select name="type" id="type">
			<option value="A">A</option>
			<option value="AAAA">AAAA/IPv6</option>
			<option value="CNAME">CNAME</option>
			<option value="MX">MX</option>
			<option value="NS">NS</option>
			<option value="PTR">PTR (reverse DNS)</option>
			<option value="SOA">SOA</option>
			<!-- <option value="TXT">TXT</option> -->
		</select>
		<input value="Lookup" type="submit" />
	</form>';

// Do the lookup.
do_lookup($root_servers);

echo '
	<p>
		These results are returned in real-time, and are not cached. This means that these results are what DNS servers all over the world are seeing at the moment.<br />
		<a href="traversal.php?host=', $_GET['host'], '&type=', $_GET['type'], '">See a DNS traversal</a>.
	</p>';

//function do_lookup($domain, &$servers)
function do_lookup($servers)
{
	global $resolver;
	// Set the name servers.
	$resolver->nameservers = $servers;
	// Save the start time
	$start_time = microtime(true);
	// Do this lookup.
	$response = $resolver->rawQuery($_GET['host'], $_GET['type']);
	// Get the end time
	$end_time = microtime(true);
	echo '
	Searching for ', $_GET['host'], ' at ', $response->answerfrom, ': ';
	// Did the query fail?
	if ($response->header->rcode != 'NOERROR')
	{
		echo '<span class="error">Failed: ', $response->header->rcode, '</span><br /><br />
		There is a problem with the DNS server at ', $response->answerfrom, '.';
		return;
	}
	
	// Was this server non-authoritive?
	if ($response->header->ancount == 0)
	{
		// Let's check who's in charge.
		// Start with a blank array
		$name_servers = array();
		// Loop through all of them.
		foreach ($response->authority as $authority)
		{			
			// Add this one to the list.
			//if ($authority->nsdname != '')
			if (!empty($authority->nsdname))
				$name_servers[] = $authority->nsdname;
		}
		// No servers?
		if (count($name_servers) == 0)
		{
			echo '<span class="error">Failed: No results</span><br /><br />
		This DNS record does not exist.';
			return;
		}
		
		// Pick one.
		$name_server = $name_servers[array_rand($name_servers)];

		echo 'Got referral to ', $name_server, ' [took ', number_format(($end_time - $start_time) * 1000), ' ms]<br />';
		do_lookup(array($name_server));
	}
	// It *was* authoritive.
	else
	{
		echo '[took ', number_format(($end_time - $start_time) * 1000), ' ms]<br />
	<table class="results" border="1">
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Class</th>
			<th>TTL</th>
			<th>Answer</th>
		</tr>';
		
		foreach ($response->answer as $answer)
		{
			echo '
		<tr class="answer">
			<td>', $answer->name, '</td>
			<td>', $answer->type, '</td>
			<td>', $answer->class, '</td>
			<td>', $answer->ttl, '</td>
			<td>', format_answer($answer), '</td>
		</tr>';
		}
		
		foreach ($response->authority as $answer)
		{
			echo '
		<tr class="authority">
			<td>', $answer->name, '</td>
			<td>', $answer->type, '</td>
			<td>', $answer->class, '</td>
			<td>', $answer->ttl, '</td>
			<td>', $answer->nsdname, '</td>
		</tr>';
		}
		
		foreach ($response->additional as $answer)
		{
			echo '
		<tr class="additional">
			<td>', $answer->name, '</td>
			<td>', $answer->type, '</td>
			<td>', $answer->class, '</td>
			<td>', $answer->ttl, '</td>
			<td>', $answer->address, '</td>
		</tr>';
		}
		echo '
	</table>';		
	}
}

include '../includes/footer.php';
?>
