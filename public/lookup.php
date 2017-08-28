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
	<form class="form-inline" method="get" action="/lookup" data-tool-url="/lookup/{host}/{type}/">
		<div class="form-group">
			<label for="host" class="col-2">Host:</label>
			<input type="text" class="form-control col-9" name="host" id="host" value="', $_GET['host'], '" />
		</div>
		<div class="form-group">
			<label for="type" class="col-2">Type:</label>
			<select name="type" id="type" class="form-control col-9">
				<option value="A">A</option>
				<option value="AAAA">AAAA/IPv6</option>
				<option value="CNAME">CNAME</option>
				<option value="MX">MX</option>
				<option value="NS">NS</option>
				<option value="PTR">PTR (reverse DNS)</option>
				<option value="SOA">SOA</option>
				<option value="TXT">TXT</option>
			</select>
		</div>
		<input value="Lookup" type="submit" class="btn btn-primary ml-2" />
	</form>';

$root_servers = get_root_servers();
$root_server = $root_servers[array_rand($root_servers)];
do_lookup($root_server);

echo '
	<p>
		These results are returned in real-time, and are not cached. This means that these results are what DNS servers all over the world are seeing at the moment.<br />
		<a href="/traversal/', $_GET['host'], '/', $_GET['type'], '/">See a DNS traversal</a>.
	</p>';

function do_lookup($server_name, $server_ip = null)
{
  echo 'Searching for ', $_GET['host'], ' at ', $server_name, ': ';
  if (empty($server_ip)) {
		$server_ip = gethostbyname($server_name);
	}

	$resolver = new Net_DNS2_Resolver([
		'nameservers' => [$server_ip],
	]);

	$start_time = microtime(true);
	$response = null;
	try {
		$response = $resolver->query($_GET['host'], $_GET['type']);
	} catch (Net_DNS2_Exception $e) {
    echo '<span class="error">Failed: ', $e->getMessage(), '</span><br /><br />
		<div class="alert alert-danger" role="alert">
			There is a problem with the DNS server at ', $server_name, '.
		</div>';
    return;
	}
	$end_time = microtime(true);

	// DNS server was authoritive and no results exist
	if ($response->header->aa && count($response->answer) === 0) {
    echo '<span class="error">Failed: No results</span><br /><br />
		<div class="alert alert-danger" role="alert">
			This DNS record does not exist.
		</div>';
    return;
	}

	// Was this server non-authoritive?
	if (count($response->answer) === 0)
	{
    // Let's check who's in charge.
    // Randomly pick one of the authoritive servers
		$new_server = $response->authority[array_rand($response->authority)];
    // See if glue was provided with an IP
		$new_server_ip = null;
		foreach ($response->additional as $additional) {
			if (
				$additional->name === $new_server->nsdname &&
				$additional->type === 'A'
			) {
        $new_server_ip = $additional->address;
			}
		}

		echo 'Got referral to ', $new_server->nsdname, ' [took ', number_format(($end_time - $start_time) * 1000), ' ms]<br />';
		do_lookup($new_server->nsdname, $new_server_ip);
	}
	// It *was* authoritive.
	else
	{
		echo '[took ', number_format(($end_time - $start_time) * 1000), ' ms]<br />
	<table class="table mt-2">
		<thead class="thead-default">
			<tr>
				<th>Name</th>
				<th>Type</th>
				<th>TTL</th>
				<th>Answer</th>
			</tr>
		</thead>
		<tbody>';

		foreach ($response->answer as $answer)
		{
			echo '
			<tr class="answer">
				<td>', $answer->name, '</td>
				<td>', $answer->type, '</td>
				<td>', $answer->ttl, '</td>
				<td>', format_answer($answer), '</td>
			</tr>';
		}
		echo '
		</tbody>';

		if (count($response->authority) !== 0) {
			echo '
			<thead>
				<tr>
					<th colspan="4">Authority</th>
				</tr>
			</thead>
			<tbody>';

			$authority = $response->authority;
			usort($authority, function($a, $b) { return strcasecmp($a->nsdname, $b->nsdname); });

			foreach ($authority as $answer)
			{
				echo '
				<tr class="authority">
					<td>', $answer->name, '</td>
					<td>', $answer->type, '</td>
					<td>', $answer->ttl, '</td>
					<td>', $answer->nsdname, '</td>
				</tr>';
			}
			echo '
			</tbody>';
		}

		if (count($response->additional) !== 0) {
      echo '
			<thead>
				<tr>
					<th colspan="4">Additional</th>
				</tr>
			</thead>
			<tbody>';

      $additional = $response->additional;
      usort($additional, function($a, $b) { return strcasecmp($a->address, $b->address); });

      foreach ($additional as $answer)
      {
        echo '
				<tr class="additional">
					<td>', $answer->name, '</td>
					<td>', $answer->type, '</td>
					<td>', $answer->ttl, '</td>
					<td>', $answer->address, '</td>
				</tr>';
      }
      echo '
			</tbody>';
		}

		echo '
	</table>';
	}
}

include '../includes/footer.php';
?>
