(function () {
  // Find all forms and add an event handler so the submission goes to the
  // "pretty URL" rather than using querystrings.
  var forms = document.querySelectorAll('form');
  for (var i = 0; i < forms.length; i++) {
    var form = forms[i];
    var urlTemplate = form.getAttribute('data-tool-url');
    if (urlTemplate) {
      addSubmitHandler(form, urlTemplate);
    }
  }

  function addSubmitHandler(form, urlTemplate) {
    form.addEventListener('submit', function (e) {
      var url = urlTemplate;
      for (var i = 0; i < form.elements.length; i++) {
        var el = form.elements[i];
        if (el.name) {
          url = url.replace('{' + el.name + '}', el.value);
        }
      }
      window.location = url;
      e.preventDefault();
    }, false);
  }

  function renderCaptcha() {
    grecaptcha.render(
      document.getElementById('whois-captcha'),
      {
        sitekey: '6LfMTy4UAAAAAAnvemeft0rzk9pIOmJEEwoovEDC'
      }
    );
  }

  window.captchaReady = function () {
    var $whoisHost = document.getElementById('whois-host');
    var $whoisCaptcha = document.getElementById('whois-captcha');
    if (!$whoisHost || !$whoisCaptcha) {
      return;
    }
    $whoisHost.addEventListener('focus', function () {
      renderCaptcha();
      renderCaptcha = function () {
      };
    }, false);
  };
}());
