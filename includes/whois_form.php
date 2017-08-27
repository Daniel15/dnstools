<div class="form-group row">
  <label for="whois-host" class="col-2 col-form-label">Host:</label>
  <div class="col-10">
    <input class="form-control" type="text" name="host" id="whois-host" value="<?= htmlspecialchars(empty($_POST['host']) ? '' : $_POST['host']) ?>" />
  </div>
</div>
<?php if (empty($_SESSION['passed_captcha'])) { ?>
  <div id="whois-captcha" class="mb-4"></div>
<?php } ?>
<input value="Lookup" type="submit" class="btn btn-primary" />
