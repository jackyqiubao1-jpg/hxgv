/* 站内搜索：加载 /index.json 做前端关键词匹配 */
(function () {
  var input = document.getElementById('site-search');
  var box = document.getElementById('search-results');
  if (!input || !box) return;

  var index = null;
  var loading = null;

  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = fetch('/index.json')
      .then(function (r) { return r.json(); })
      .then(function (data) { index = data; return index; })
      .catch(function () { index = []; return index; });
    return loading;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function snippet(text, kw) {
    var i = text.toLowerCase().indexOf(kw.toLowerCase());
    if (i < 0) return esc(text.slice(0, 120)) + '...';
    var start = Math.max(0, i - 40);
    var end = Math.min(text.length, i + kw.length + 80);
    var out = esc(text.slice(start, end));
    // 高亮关键词
    var re = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    out = out.replace(re, '<mark>$1</mark>');
    return (start > 0 ? '...' : '') + out + (end < text.length ? '...' : '');
  }

  function render(results, kw) {
    if (!results.length) {
      box.innerHTML = '<div class="sr-empty">没有找到 "' + esc(kw) + '" 相关的内容</div>';
    } else {
      box.innerHTML = results.map(function (r) {
        return '<a class="sr-item" href="' + esc(r.url) + '">' +
          '<span class="sr-title">' + esc(r.title) + '</span>' +
          '<span class="sr-snippet">' + snippet(r.content || r.summary || '', kw) + '</span>' +
          '</a>';
      }).join('');
    }
    box.hidden = false;
  }

  var timer = null;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    var kw = input.value.trim();
    if (kw.length < 2) { box.hidden = true; box.innerHTML = ''; return; }
    timer = setTimeout(function () {
      loadIndex().then(function (pages) {
        var low = kw.toLowerCase();
        var hits = [];
        pages.forEach(function (p) {
          var hay = ((p.title || '') + ' ' + (p.content || '') + ' ' + (p.summary || '')).toLowerCase();
          if (hay.indexOf(low) >= 0) hits.push(p);
        });
        // 标题命中排前面
        hits.sort(function (a, b) {
          var at = (a.title || '').toLowerCase().indexOf(low) >= 0 ? 0 : 1;
          var bt = (b.title || '').toLowerCase().indexOf(low) >= 0 ? 0 : 1;
          return at - bt;
        });
        render(hits.slice(0, 10), kw);
      });
    }, 200);
  });

  // 点外部关闭，Esc 关闭
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-wrap')) { box.hidden = true; }
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { box.hidden = true; input.blur(); }
  });
})();
