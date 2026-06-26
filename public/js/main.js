(function () {
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
        var label = btn.querySelector('[data-label]');
        if (label) label.textContent = data.bookmarked ? 'Saved' : 'Save';
      } catch (e) {}
    });
  });
})();
