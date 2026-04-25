'use strict';

hexo.extend.filter.register('after_generate', function () {
  const route = hexo.route;
  const languages = Array.isArray(hexo.config.language) ? hexo.config.language : [hexo.config.language];
  const defaultLang = String(languages[0] || '').toLowerCase();
  if (!defaultLang) return;

  const root = String(hexo.config.root || '/');

  function toUrl(routePath) {
    let p = String(routePath || '').replace(/\\/g, '/');
    if (p.endsWith('index.html')) p = p.slice(0, -'index.html'.length);
    if (!p.startsWith('/')) p = '/' + p;
    const normalizedRoot = root.endsWith('/') ? root : root + '/';
    return normalizedRoot.replace(/\/+/g, '/').replace(/([^:])\/\//g, '$1/') + p.replace(/^\//, '');
  }

  function redirectHtml(targetUrl) {
    return '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=' + targetUrl + '"><script>location.replace(' + JSON.stringify(targetUrl) + ');</script></head><body><a href="' + targetUrl + '">Redirect</a></body></html>';
  }

  const allRoutes = route.list();
  const existing = new Set(allRoutes);

  allRoutes.forEach((p) => {
    const normalized = String(p || '');
    if (!normalized) return;
    if (normalized.startsWith(defaultLang + '/')) return;

    // We only enforce default language prefix for blog routes.
    if (!normalized.startsWith('blog/')) return;

    const source = route.routes[route.format(normalized)];
    if (!source || source.data == null) return;

    const aliasPath = defaultLang + '/' + normalized;
    if (existing.has(aliasPath)) return;

    // Alias prefixed route to original route data (function/string/buffer), not stream instance.
    route.set(aliasPath, {
      data: source.data,
      modified: source.modified
    });

    // Guard: non-language blog URLs redirect to default-language prefixed URL.
    route.set(normalized, redirectHtml(toUrl(aliasPath)));

    existing.add(aliasPath);
  });
});

// Runtime guard for `hexo server` so visiting `/blog` always lands on default language.
hexo.extend.filter.register('server_middleware', function (app) {
  const languages = Array.isArray(hexo.config.language) ? hexo.config.language : [hexo.config.language];
  const defaultLang = String(languages[0] || '').toLowerCase();
  if (!defaultLang) return;
  const root = String(hexo.config.root || '/');
  const normalizedRoot = root.endsWith('/') ? root : root + '/';

  app.use((req, res, next) => {
    const u = String(req.url || '');
    if (!u.startsWith(normalizedRoot + 'blog')) return next();
    const rest = u.substring((normalizedRoot + 'blog').length);
    if (rest.startsWith('/')) {
      res.statusCode = 302;
      res.setHeader('Location', normalizedRoot + defaultLang + '/blog' + rest);
      return res.end();
    }
    if (rest === '' || rest.startsWith('?')) {
      res.statusCode = 302;
      res.setHeader('Location', normalizedRoot + defaultLang + '/blog/' + (rest.startsWith('?') ? rest : ''));
      return res.end();
    }
    return next();
  });
}, 5);
