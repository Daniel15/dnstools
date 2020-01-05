<?php
require '../functions.php';

if ($_SERVER['REMOTE_ADDR'] !== '127.0.0.1') {
	die('Only connections from localhost are allowed');
}

if (empty($_POST['host']))
	die();

// Get rid of bad characters.
$_POST['host'] = clean_hostname($_POST['host']);

$page['title'] = 'WHOIS for ' . $_POST['host'];

function format_contact(\Novutec\WhoisParser\Result\Contact $contact)
{
	$output = '';
	if (!empty($contact->name)) {
		$output .= '<strong>' . htmlspecialchars($contact->name) . "</strong>\n";
	}
	if (!empty($contact->organization)) {
		$output .= htmlspecialchars($contact->organization) . "\n";
	}
	if (!empty($contact->email)) {
		$output .= 'Email: ' . htmlspecialchars($contact->email) . "\n";
	}
	if (!empty($contact->phone)) {
		$output .= 'Phone: ' . htmlspecialchars($contact->phone) . "\n";
	}
	if (!empty($contact->fax)) {
		$output .= 'Fax: ' . htmlspecialchars($contact->fax) . "\n";
	}
	$address = '';
	if (!empty($contact->address)) {
		$raw_address = is_array($contact->address)
			? implode(", ", $contact->address)
			: $contact->address;
		$address .= htmlspecialchars($raw_address) . ', ';
	}
	if (!empty($contact->city)) {
		$address .= htmlspecialchars($contact->city) . ' ';
	}
	if (!empty($contact->state)) {
		$address .= htmlspecialchars($contact->state) . ' ';
	}
	if (!empty($contact->zipcode)) {
		$address .= htmlspecialchars($contact->zipcode) . ' ';
	}
	if (!empty($contact->country)) {
		$address .= htmlspecialchars($contact->country) . ' ';
	}

	if ($address !== '') {
		$output .= 'Address: ' . $address . "\n";
	}

	return nl2br($output);
}

try {
	$parser = new Novutec\WhoisParser\Parser();
	$result = $parser->lookup($_POST['host']);
	if (!empty($result->exception)) {
		echo '<!-- Exception: ', htmlspecialchars($result->exception), ' -->';
	}
	echo '<!-- Template: ', json_encode($result->template), ' -->';

	if (count($result->rawdata) === 0) {
		throw new Exception('PHP library failed to get whois');
	}
	if (empty($result->rawdata[count($result->rawdata) - 1])) {
		throw new Exception('Raw data is empty');
	}
	$raw_data = $result->rawdata[count($result->rawdata) - 1];
	if (strpos(strtolower($raw_data), strtolower($_POST['host'])) === false) {
		throw new Exception('Bad response: Raw data does not include hostname');
	}
?>
		<table class="table table-striped mt-4">
			<tbody>
				<?php
				if (!empty($result->created)) {
					echo '
						<tr>
							<th>Created</th>
							<td>', htmlspecialchars($result->created), '</td>
						</tr>';
				}
				if (!empty($result->changed)) {
					echo '
						<tr>
							<th>Last Changed</th>
							<td>', htmlspecialchars($result->changed), '</td>
						</tr>';
				}
				if (!empty($result->expires)) {
					echo '
						<tr>
							<th>Expires</th>
							<td>', htmlspecialchars($result->expires), '</td>
						</tr>';
				}
				if (!empty($result->registrar)) {
					echo '
						<tr>
							<th>Registrar</th>
							<td>';

					$name = '';
					if (!empty($result->registrar->name)) {
						$name = $result->registrar->name;
					}

					if (!empty($result->registrar->url)) {
						$name = $name === ''
							? $result->registrar->url
							: '<a href="' . htmlspecialchars($result->registrar->url) . '" rel="nofollow">' . $name . '</a>';
					}
					echo $name;

					if (!empty($result->registrar->email)) {
						echo ', ', htmlspecialchars($result->registrar->email);
					}

					if (!empty($result->registrar->phone)) {
						echo ', ', htmlspecialchars($result->registrar->phone);
					}

					echo '
							</td>
						</tr>';
				}
				if (!empty($result->nameserver)) {
					echo '
						<tr>
							<th>Nameservers</th>
							<td>', htmlspecialchars(implode(', ', $result->nameserver)), '</td>
						</tr>';
				}
				if (!empty($result->contacts->owner) && count($result->contacts->owner) !== 0) {
					echo '
						<tr>
							<th>Owner</th>
							<td>', format_contact($result->contacts->owner[0]), '</td>
						</tr>';
				}
				if (!empty($result->contacts->admin) && count($result->contacts->admin) !== 0) {
					echo '
						<tr>
							<th>Administrative Contact</th>
							<td>', format_contact($result->contacts->admin[0]), '</td>
						</tr>';
				}
				if (!empty($result->contacts->tech) && count($result->contacts->tech) !== 0) {
					echo '
						<tr>
							<th>Technical Contact</th>
							<td>', format_contact($result->contacts->tech[0]), '</td>
						</tr>';
				}
				?>
			</tbody>
		</table>
		<h5>Raw Response</h5>
		<?= '<pre>' . htmlspecialchars($raw_data) . '</pre>'; ?>
<?php
} catch (Exception $ex) {
	// PHP library failed, so just fall back to system whois command
	echo '<!-- Fallback: ' . htmlspecialchars($ex->getMessage()) . " -->\n";
	echo '<pre>';
	system('whois -H ' . $_POST['host']);
	echo '</pre>';
}
