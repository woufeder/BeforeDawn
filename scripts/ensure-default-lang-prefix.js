'use strict';

hexo.extend.filter.register('after_generate', function () {
  const route = hexo.route;
  const languages = Array.isArray(hexo.config.language) ? hexo.config.language : [hexo.config.language];
  const defaultLang = String(languages[0] || '').toLowerCase();
  if (!defaultLang) return;

  const prefixScopes = [
    'blog/',
    'about/',
    'original/',
    'project/',
    'music/',
    'others/'
  ];

  const allRoutes = route.list();
  const existing = new Set(allRoutes);

  allRoutes.forEach((p) => {
    const normalized = String(p || '');
    if (!normalized) return;
    if (normalized.startsWith(defaultLang + '/')) return;

    const shouldAlias = prefixScopes.some(scope => normalized.startsWith(scope));
    if (!shouldAlias) return;

    const aliasPath = defaultLang + '/' + normalized;
    if (existing.has(aliasPath)) return;

    route.set(aliasPath, route.get(normalized));
    existing.add(aliasPath);
  });
});
