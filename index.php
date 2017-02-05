<?php
include 'includes/3rdparty/php-captcha.inc.php';

$page['title'] = 'Welcome to DNSTools.ws!';
include 'includes/header.php';
?>
	<p>Welcome to DNSTools.ws! This site is currently under construction.</p>
	
	<div class="column">
		<div class="tool">
			<h3>DNS Lookup</h3>
			<p>Look up a DNS record.</p>
			<form method="get" action="tools/lookup.php">
				<label>Host: <input type="text" name="host" /></label><br />
				<label for="type">Type:</label>
				<select name="type" id="type">
					<option value="A">A</option>
					<option value="AAAA">AAAA/IPv6</option>
					<option value="CNAME">CNAME</option>
					<option value="MX">MX</option>
					<option value="NS">NS</option>
					<option value="PTR">PTR (reverse DNS)</option>
					<option value="SOA">SOA</option>
					<!-- <option value="TXT">TXT</option> -->
				</select><br />
				<input value="Lookup" type="submit" />
			</form>
		</div>
		
		<div class="tool">
			<h3>DNS Traversal</h3>
			<p>Shows every DNS server that is (or may be) used for a DNS lookup, and what the servers return.</p>
			<form method="get" action="tools/traversal.php">
				<label>Host: <input type="text" name="host" /></label><br />
				<label for="type">Type:</label>
				<select name="type" id="type">
					<option value="A">A</option>
					<option value="AAAA">AAAA/IPv6</option>
					<option value="CNAME">CNAME</option>
					<option value="MX">MX</option>
					<option value="NS">NS</option>
					<option value="PTR">PTR (reverse DNS)</option>
					<option value="SOA">SOA</option>
					<!-- <option value="TXT">TXT</option> -->
				</select><br />
				<input value="Lookup" type="submit" />
			</form>	
		</div>
		
		<div class="tool">
			<h3>Reverse DNS (PTR)</h3>
			<p>Convert an IP address into a hostname.</p>
			<form method="get" action="tools/lookup.php">
				<input type="hidden" name="type" value="PTR" />
				<label>IP address: <input type="text" name="host" /></label><br />
				<input value="Lookup" type="submit" />
			</form>	
		</div>
	</div>
	
	<div class="column">
		<div class="tool">
			<h3>WHOIS</h3>
			<p>Get information on a domain name or IP address.</p>
			<form method="post" action="tools/whois.php">
				<label>Host: <input type="text" name="host" /></label><br />
				
				<label for="code">Verification code:</label><br />
				<img src="captcha.php" width="200" height="60" alt="Verification Code" /><br />
				<input type="text" name="code" id="code" />
				<p style="font-size: x-small">Please enter the code to prove you're not a bot.</p>
						
				<input value="Lookup" type="submit" />
			</form>
		</div>
	</div>
	
	<div class="column">
		<div class="tool">
			<h3>Traceroute</h3>
			<p>Show the route packets take to a particular host.</p>
			<form method="get" action="tools/traceroute.php">
				<label>Host: <input type="text" name="host" /></label><br />
				<input value="Traceroute" type="submit" />
			</form>
		</div>
		
		<div class="tool">
			<h3>Ping</h3>
			<p>Show the round trip time (RTT) to a server.</p>
			<form method="get" action="tools/ping.php">
				<label>Host: <input type="text" name="host" /></label><br />
				<input value="Ping" type="submit" />
			</form>	
		</div>
	</div>
	<br style="clear: left" />
<?php
include 'includes/footer.php';
?>
