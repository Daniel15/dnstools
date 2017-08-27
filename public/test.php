<?php
require __DIR__.'/../vendor/autoload.php';

function format_exception(Exception $ex, $indent = 0) {
  $output = get_class($ex).' - '.$ex->getMessage();
  if ($ex instanceof Amp\CombinatorException) {
    foreach ($ex->getExceptions() as $inner) {
      $output .= "\n".str_repeat('  ', $indent). ' --> '.format_exception($inner, $indent + 1);
    }
  } else {
    $prev = $ex->getPrevious();
    if ($prev) {
      $output .= "\n".str_repeat('  ', $indent). ' --> '.format_exception($prev, $indent + 1);
    }
  }
  return $output;
}

const IPS_TO_LOAD = 10;

Amp\run(function () {
  $start_ip = '209.141.56.29';
  $start_ip_raw = ip2long($start_ip);

  for (
    $current_ip_raw = $start_ip_raw - IPS_TO_LOAD;
    $current_ip_raw < $start_ip_raw + IPS_TO_LOAD;
    $current_ip_raw++
  ) {
    $current_ip = long2ip($current_ip_raw);
    $ips[] = $current_ip;
    $lookups[$current_ip] = Amp\Dns\query($current_ip, Amp\Dns\Record::PTR);
  }
  list($failed, $succeeded) = (yield Amp\any($lookups));

  echo '**** ', count($failed), " failures! ****\n\n";
  foreach ($ips as $ip) {
    if (array_key_exists($ip, $succeeded)) {
      list(list($result)) = $succeeded[$ip];
      echo $ip, ': ', $result, "\n";
    } else if (array_key_exists($ip, $failed)) {
      $ex = $failed[$ip];
      if ($ex instanceof Amp\Dns\NoRecordException) {
        echo $ip, ": No reverse DNS\n";
      } else {
        echo $ip, ': EXCEPTION: ', format_exception($ex), "\n";
      }
    } else {
      echo $ip, ": UNKNOWN\n";
    }
  }
});
