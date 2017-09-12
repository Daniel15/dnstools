<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
  <title>DNSTools.ws <?php echo(!empty($page['title']) ? ' &mdash; ' . $page['title'] : ''); ?></title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css"
        integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous"/>
  <link rel="stylesheet" type="text/css" href="/res/style.css"/>
  <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-25623237-9', 'auto');
    ga('send', 'pageview');
  </script>
</head>
<body>
<div class="container">
  <h1 class="main-header"><?php echo(!empty($page['title']) ? $page['title'] : 'DNSTools.ws'); ?></h1>
  <?php if (empty($_COOKIE['birthday_dismissed'])): ?>
    <div class="alert alert-info alert-dismissible fade show" role="alert">
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      Happy Birthday DNSTools.ws! This month we're celebrating 10 years of no-nonsense
      ad-free DNS tools!
      <img src="https://emojistatic.github.io/images/16/1f389.png" alt="🎉" />
      <br />
      Use DNSTools a lot? Have comments or suggestions? Feel free to send them my way:
      <a href="mailto:dnstools@dan.cx">dnstools@dan.cx</a>
    </div>
  <?php endif; ?>
