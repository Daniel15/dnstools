<?php
include '../includes/3rdparty/php-captcha.inc.php';

$page['title'] = 'Welcome to DNSTools.ws!';
include '../includes/header.php';
?>

	<div class="row">
		<div class="col">
			<div class="card mb-4">
				<h5 class="card-header">DNS Lookup</h5>
			  <div class="card-block">
					<p class="card-text">Look up a DNS record.</p>
					<form method="get" action="/lookup" data-tool-url="/lookup/{host}/{type}/">
						<div class="form-group row">
						  <label for="dnslookup-host" class="col-2 col-form-label">Host:</label>
						  <div class="col-10">
						    <input class="form-control" type="text" name="host" id="dnslookup-host" />
						  </div>
						</div>
						<div class="form-group row">
						  <label for="type" class="col-2 col-form-label">Type:</label>
						  <div class="col-10">
								<select name="type" id="type" class="form-control">
									<option value="A">A</option>
									<option value="AAAA">AAAA/IPv6</option>
									<option value="CNAME">CNAME</option>
									<option value="MX">MX</option>
									<option value="NS">NS</option>
									<option value="PTR">PTR (reverse DNS)</option>
									<option value="SOA">SOA</option>
									<!-- <option value="TXT">TXT</option> -->
								</select>
						  </div>
						</div>
						<input value="Lookup" type="submit" class="btn btn-primary" />
					</form>
				</div>
			</div>

			<div class="card mb-4">
				<h5 class="card-header">DNS Traversal</h5>
			  <div class="card-block">
					<p class="card-text">Shows every DNS server that is (or may be) used for a DNS lookup, and what the servers return.</p>
					<form method="get" action="/traversal" data-tool-url="/traversal/{host}/{type}/">
						<div class="form-group row">
						  <label for="traversal-host" class="col-2 col-form-label">Host:</label>
						  <div class="col-10">
						    <input class="form-control" type="text" name="host" id="traversal-host" />
						  </div>
						</div>
						<div class="form-group row">
						  <label for="traversal-type" class="col-2 col-form-label">Type:</label>
						  <div class="col-10">
								<select name="type" id="traversal-type" class="form-control">
									<option value="A">A</option>
									<option value="AAAA">AAAA/IPv6</option>
									<option value="CNAME">CNAME</option>
									<option value="MX">MX</option>
									<option value="NS">NS</option>
									<option value="PTR">PTR (reverse DNS)</option>
									<option value="SOA">SOA</option>
									<!-- <option value="TXT">TXT</option> -->
								</select>
							</div>
						</div>
						<input value="Lookup" type="submit" class="btn btn-primary" />
					</form>
				</div>
			</div>

			<div class="card mb-4">
				<h5 class="card-header">Reverse DNS (PTR)</h5>
			  <div class="card-block">
					<p class="card-text">Convert an IP address into a hostname.</p>
					<form method="get" action="/lookup" data-tool-url="/lookup/{host}/{type}/">
						<input type="hidden" name="type" value="PTR" />
						<div class="form-group row">
						  <label for="ptr-host" class="col-4 col-form-label">IP address:</label>
						  <div class="col-8">
						    <input class="form-control" type="text" name="host" id="ptr-host" />
						  </div>
						</div>
						<input value="Lookup" type="submit" class="btn btn-primary" />
					</form>
				</div>
			</div>
		</div>

		<div class="col">
			<div class="card mb-4">
				<h5 class="card-header">WHOIS</h5>
			  <div class="card-block">
					<p class="card-text">Get information on a domain name or IP address.</p>
					<form method="post" action="/whois">
						<div class="form-group row">
						  <label for="whois-host" class="col-2 col-form-label">Host:</label>
						  <div class="col-10">
						    <input class="form-control" type="text" name="host" id="whois-host" />
						  </div>
						</div>

						<label for="code">Verification code:</label><br />
						<img src="captcha.php" width="200" height="60" alt="Verification Code" /><br />
						<input class="form-control" type="text" name="code" id="code" />
						<p style="font-size: x-small">Please enter the code to prove you're not a bot.</p>

						<input value="Lookup" type="submit" class="btn btn-primary" />
					</form>
				</div>
			</div>
		</div>

		<div class="col">
			<div class="card mb-4">
				<h5 class="card-header">Traceroute</h5>
			  <div class="card-block">
					<p class="card-text">Show the route packets take to a particular host.</p>
					<form method="get" action="/traceroute" data-tool-url="/traceroute/{host}/">
						<div class="form-group row">
						  <label for="tracert-host" class="col-2 col-form-label">Host:</label>
						  <div class="col-10">
						    <input class="form-control" type="text" name="host" id="tracert-host" />
						  </div>
						</div>
						<input value="Traceroute" type="submit" class="btn btn-primary" />
					</form>
				</div>
			</div>

			<div class="card mb-4">
				<h5 class="card-header">Ping</h5>
			  <div class="card-block">
					<p class="card-text">Show the round trip time (RTT) to a server.</p>
					<form method="get" action="/ping" data-tool-url="/ping/{host}/">
						<div class="form-group row">
						  <label for="ping-host" class="col-2 col-form-label">Host:</label>
						  <div class="col-10">
						    <input class="form-control" type="text" name="host" id="ping-host" />
						  </div>
						</div>
						<input value="Ping" type="submit" class="btn btn-primary" />
					</form>
				</div>
			</div>
		</div>
	</div>
<?php
include '../includes/footer.php';
?>
