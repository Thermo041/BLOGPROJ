(function () {
  // Clear stale flash alerts restored from browser bfcache
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      window.location.reload();
    }
  });

  document.querySelectorAll('.flash-alert').forEach(function (el) {
    setTimeout(function () {
      el.classList.add('hide');
      setTimeout(function () { el.remove(); }, 400);
    }, 3500);
  });

  var toggle = document.querySelector('.theme-toggle');
  var html = document.documentElement;
  var saved = localStorage.getItem('bs-theme');
  if (saved) html.setAttribute('data-theme', saved);
  if (toggle) {
    toggle.checked = html.getAttribute('data-theme') === 'paper';
    toggle.addEventListener('change', function () {
      var theme = toggle.checked ? 'paper' : 'ink';
      html.setAttribute('data-theme', theme);
      localStorage.setItem('bs-theme', theme);
    });
  }

  document.querySelectorAll('[data-like]').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var id = btn.getAttribute('data-like');
      try {
        var res = await fetch('/blogs/' + id + '/like', { method: 'POST', headers: { 'Accept': 'application/json' } });
        if (res.status === 401 || res.redirected) { window.location = '/login'; return; }
        var data = await res.json();
        btn.classList.toggle('active', data.liked);
        btn.classList.toggle('btn-primary', data.liked);
        btn.classList.toggle('btn-outline', !data.liked);
        var c = btn.querySelector('[data-count]');
        if (c) c.textContent = data.count;
      } catch (e) {}
    });
  });

  document.querySelectorAll('[data-bookmark]').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var id = btn.getAttribute('data-bookmark');
      try {
        var res = await fetch('/blogs/' + id + '/bookmark', { method: 'POST', headers: { 'Accept': 'application/json' } });
        if (res.status === 401 || res.redirected) { window.location = '/login'; return; }
        var data = await res.json();
        btn.classList.toggle('active', data.bookmarked);
        btn.classList.toggle('btn-primary', data.bookmarked);
        btn.classList.toggle('btn-outline', !data.bookmarked);
        var label = btn.querySelector('[data-label]');
        if (label) label.textContent = data.bookmarked ? 'Saved' : 'Save';
      } catch (e) {}
    });
  });

  var viewsEl = document.querySelector('[data-views-blog]');
  if (viewsEl) {
    var blogId = viewsEl.getAttribute('data-views-blog');
    var countEl = viewsEl.querySelector('[data-views-count]');
    setInterval(async function () {
      if (document.hidden) return;
      try {
        var res = await fetch('/blogs/' + blogId + '/views', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return;
        var data = await res.json();
        if (countEl && typeof data.views === 'number') countEl.textContent = data.views;
      } catch (e) {}
    }, 10000);
  }

  // Instant frontend password validation
  document.querySelectorAll('form').forEach(function (form) {
    var pass = form.querySelector('input[name="password"]');
    var conf = form.querySelector('input[name="confirm"]');
    if (pass && conf) {
      function checkMatch() {
        if (pass.value !== conf.value) {
          conf.setCustomValidity('Passwords do not match');
        } else {
          conf.setCustomValidity('');
        }
      }
      pass.addEventListener('input', checkMatch);
      conf.addEventListener('input', checkMatch);
    }
  });
})();
