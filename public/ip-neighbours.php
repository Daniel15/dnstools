<?php
require '../includes/functions.php';
// Number of IP addresses to show either side of the specified IP.
const IPS_TO_SHOW = 10;

if (empty($_GET['ip'])) {
  header('Location: /');
  die();
}

function run() {
  $ip_raw = ip2long($_GET['ip']);
  $selected_ip = long2ip($ip_raw);
  if ($ip_raw === false) {
    ?>
    <div class="alert alert-danger" role="alert">
      <strong><?= htmlspecialchars($_GET['ip']) ?></strong>
      is not a valid IP address!
    </div>
    <?php
    return;
  }

  $ips = [];
  $lookups = [];
  for (
    $current_ip_raw = $ip_raw - IPS_TO_SHOW;
    $current_ip_raw < $ip_raw + IPS_TO_SHOW;
    $current_ip_raw++
  ) {
    $current_ip = long2ip($current_ip_raw);
    $ips[] = $current_ip;
    $lookups[$current_ip] = Amp\Dns\query($current_ip, Amp\Dns\Record::PTR, [
      'timeout' => 10000,
    ]);
  }

  list($failed, $succeeded) = (yield Amp\any($lookups));
  ?>
  <table class="table">
    <thead>
      <tr>
        <th>IP</th>
        <th>Hostname</th>
      </tr>
    </thead>
    <tbody>
      <?php
      foreach ($ips as $ip) {
        $class = '';
        if ($ip === $selected_ip) {
          $class = 'table-success';
        }
        ?>
          <tr class=<?= $class ?>>
            <td>
              <a href="/ip-neighbours/<?= htmlspecialchars($ip) ?>">
                <?= htmlspecialchars($ip) ?>
              </a>
            </td>
            <td>
              <?php
                if (array_key_exists($ip, $succeeded)) {
                  list(list($result)) = $succeeded[$ip];
                  echo $result;
                } else if (array_key_exists($ip, $failed)) {
                  $ex = $failed[$ip];
                  if ($ex instanceof Amp\Dns\NoRecordException) {
                    echo '<em>No reverse dns</em>';
                  } else {
                    echo 'ERROR: ' . get_class($failed[$ip]) . ' - ' . $failed[$ip]->getMessage();
                    //print_r($failed[$ip]);
                  }
                } else {
                  echo 'UNKNOWN';
                }
              ?>
            </td>
          </tr>
        <?php
      }
      ?>
    </tbody>
  </table>
  <?php
}

$page['title'] = 'IP Neighbours for '.htmlspecialchars($_GET['ip']);
include '../includes/header.php';
Amp\run('run');
include '../includes/footer.php';
?>
