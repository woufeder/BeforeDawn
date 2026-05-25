'use strict';

var labels = {
  en: {
    home: 'Home',
    about: 'About',
    original: 'Original',
    project: 'Project',
    music: 'Music',
    others: 'Others',
    blog: 'Blog',
    archives: 'Archives',
    categories: 'Categories',
    all_posts: 'All Posts',
    tags: 'Tags',
    recent_posts: 'Recent Posts',
    search: 'Search',
    rss_feed: 'RSS Feed',
    share: 'Share'
  },
  it: {
    home: 'Home',
    about: 'About',
    original: 'Original',
    project: 'Project',
    music: 'Music',
    others: 'Others',
    blog: 'Blog',
    archives: 'Archives',
    categories: 'Categories',
    all_posts: 'Tutti gli articoli',
    tags: 'Tags',
    recent_posts: 'Recent Posts',
    search: 'Search',
    rss_feed: 'RSS Feed',
    share: 'Share'
  },
  'zh-tw': {
    home: '首頁123',
    about: '關於',
    original: '原創',
    project: '作品',
    music: '音樂',
    others: '其他',
    blog: '文章',
    archives: '文章存檔',
    categories: '分類',
    all_posts: '所有文章',
    tags: '標籤',
    recent_posts: '最新文章',
    search: '搜尋',
    rss_feed: 'RSS 新聞來源',
    share: '分享'
  }
};

function siteDefaultLang() {
  return Array.isArray(hexo.config.language) ? hexo.config.language[0] : hexo.config.language;
}

function getSiteLanguages() {
  var src = null;
  if (hexo && hexo.config && hexo.config.i18n && Array.isArray(hexo.config.i18n.languages) && hexo.config.i18n.languages.length) {
    src = hexo.config.i18n.languages;
  } else {
    src = hexo.config.language;
  }
  if (!Array.isArray(src)) src = [src];
  // normalize to lower-case and remove falsy/duplicates
  var seen = {};
  var out = [];
  for (var i = 0; i < src.length; i++){
    var v = src[i];
    if (!v) continue;
    var s = String(v).toLowerCase();
    if (seen[s]) continue;
    seen[s] = true;
    out.push(s);
  }
  return out;
}

function inferLangFromPath(path, fallback) {
  if (!path) return fallback;
  var langs = getSiteLanguages();
  var pathLower = String(path).toLowerCase();
  for (var i = 0; i < langs.length; i++){
    var l = langs[i];
    if (!l) continue;
    if (pathLower.indexOf('/' + l + '/') !== -1 || pathLower.indexOf(l + '/') === 0) return l;
  }
  return fallback;
}

function normalizePath(input) {
  if (!input) return '/';
  var value = String(input).trim();
  if (!value) return '/';
  if (value.indexOf('http://') === 0 || value.indexOf('https://') === 0) return value;
  if (value.charAt(0) !== '/') value = '/' + value;
  return value;
}

function stripBeforeDawnPrefix(path) {
  return String(path || '')
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/?BeforeDawn\/?/i, '')
    .replace(/^\/+/, '');
}

function stripLeadingLang(path) {
  return String(path || '')
    .replace(/^(zh-tw|en|it)\//i, '')
    .replace(/^\/+/, '');
}

function normalizePostPath(path) {
  return String(path || '')
    .replace(/^\/+/, '')
    .replace(/index\.html$/i, '')
    .replace(/\/+$/, '');
}

function isBlogDetailPath(pathWithoutLang) {
  var clean = normalizePostPath(pathWithoutLang);
  if (clean.indexOf('blog/') !== 0) return false;

  var rest = clean.slice(5);
  if (!rest) return false;

  var restLower = rest.toLowerCase();
  if (restLower === 'archives' || restLower.indexOf('archives/') === 0) return false;
  if (restLower === 'categories' || restLower.indexOf('categories/') === 0) return false;
  if (restLower === 'tags' || restLower.indexOf('tags/') === 0) return false;

  return true;
}

function inferPostSlugFromPath(pathWithoutLang) {
  var clean = normalizePostPath(pathWithoutLang);
  if (clean.indexOf('blog/') !== 0) return '';
  return clean.slice(5).split('/')[0] || '';
}

function findTranslatedPost(site, lang, translationKey, slug) {
  if (!site || !site.posts) return null;

  var langLower = String(lang || '').toLowerCase();
  var key = translationKey ? String(translationKey).toLowerCase() : '';
  var slugLower = slug ? String(slug).toLowerCase() : '';
  var matchedBySlug = null;

  site.posts.each(function (item) {
    if (!item) return;

    var itemLang = String(item.lang || item.language || '').toLowerCase();
    if (itemLang !== langLower) return;

    var itemKey = item.translation_key ? String(item.translation_key).toLowerCase() : '';
    if (key && itemKey && itemKey === key) {
      matchedBySlug = item;
      return;
    }

    if (!matchedBySlug && slugLower) {
      var itemSlug = String(item.slug || '').toLowerCase();
      if (itemSlug && itemSlug === slugLower) {
        matchedBySlug = item;
      }
    }
  });

  return matchedBySlug;
}

function buildLocalizedPath(pathWithoutLang, targetLang) {
  var clean = String(pathWithoutLang || '')
    .replace(/index\.html$/i, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  if (!clean) return '/' + targetLang + '/';
  return '/' + targetLang + '/' + clean + '/';
}

function currentLangFromContext(context) {
  var defaultLang = siteDefaultLang();
  var pagePermalink = context.page && context.page.permalink ? context.page.permalink : '';
  var fromPermalink = inferLangFromPath(pagePermalink, '');
  if (fromPermalink) return fromPermalink;
  var pagePath = context.page && context.page.path ? context.page.path : '';
  return inferLangFromPath(pagePath, defaultLang);
}

function buildLangVariants(lang) {
  var raw = lang ? String(lang) : '';
  if (!raw) return [];

  var out = [];
  var seen = {};

  function add(v) {
    if (!v) return;
    var s = String(v);
    if (seen[s]) return;
    seen[s] = true;
    out.push(s);
  }

  add(raw);
  add(raw.toLowerCase());

  var parts = raw.replace('_', '-').split('-');
  if (parts.length === 2) {
    add(parts[0].toLowerCase() + '-' + parts[1].toUpperCase());
    add(parts[0].toLowerCase() + '-' + parts[1].toLowerCase());
  }

  return out;
}

function translateFromThemeI18n(key, lang) {
  if (!hexo || !hexo.theme || !hexo.theme.i18n || typeof hexo.theme.i18n.__ !== 'function') {
    return key;
  }

  var order = [];
  var seen = {};

  function pushLangVariants(v) {
    var vars = buildLangVariants(v);
    for (var i = 0; i < vars.length; i++) {
      var it = vars[i];
      if (seen[it]) continue;
      seen[it] = true;
      order.push(it);
    }
  }

  pushLangVariants(lang);
  pushLangVariants(siteDefaultLang());
  if (!seen.default) {
    order.push('default');
  }

  return hexo.theme.i18n.__(order)(key);
}

hexo.extend.helper.register('bd_current_lang', function () {
  return currentLangFromContext(this);
});

hexo.extend.helper.register('bd_post_lang', function (post) {
  var defaultLang = siteDefaultLang();

  if (!post) return defaultLang;
  if (post.lang) return post.lang;
  if (post.language) return post.language;

  var found = null;
  var targetId = post._id ? String(post._id) : '';
  var targetSource = post.source || '';

  this.site.posts.each(function (item) {
    if (found) return;
    if (targetId && item._id && String(item._id) === targetId) {
      found = item;
      return;
    }
    if (targetSource && item.source && item.source === targetSource) {
      found = item;
      return;
    }
  });

  if (found) {
    if (found.lang) return found.lang;
    if (found.language) return found.language;
    return inferLangFromPath(found.path, defaultLang);
  }

  return inferLangFromPath(post.path, defaultLang);
});

hexo.extend.helper.register('bd_url_for_lang', function (targetPath, lang) {
  var defaultLang = siteDefaultLang();
  var targetLang = lang || currentLangFromContext(this);
  var normalized = normalizePath(targetPath);

  if (normalized.indexOf('http://') === 0 || normalized.indexOf('https://') === 0) {
    return normalized;
  }

  if (normalized === '/' && targetLang === defaultLang) {
    return this.url_for('/' + defaultLang + '/');
  }

  if (normalized === '/') {
    return this.url_for('/' + targetLang + '/');
  }

  var firstSeg = (normalized.split('/')[1] || '').toLowerCase();
  var langs = getSiteLanguages();
  if (langs.indexOf(firstSeg) !== -1){
    return this.url_for(normalized);
  }

  return this.url_for('/' + targetLang + normalized);
});

hexo.extend.helper.register('bd_switch_lang_url', function (targetLang) {
  var defaultLang = siteDefaultLang();
  var lang = String(targetLang || defaultLang).toLowerCase();
  var page = this.page || {};

  var rawPath = String(page.path || '');
  var pathWithoutLang = stripLeadingLang(stripBeforeDawnPrefix(rawPath));

  if (isBlogDetailPath(pathWithoutLang)) {
    var translationKey = page.translation_key || page.i18n_key || '';
    var slug = page.slug || inferPostSlugFromPath(pathWithoutLang);

    var targetPost = findTranslatedPost(this.site, lang, translationKey, slug);
    if (targetPost && targetPost.path) {
      return this.url_for('/' + String(targetPost.path).replace(/^\/+/, ''));
    }

    var zhTwPost = findTranslatedPost(this.site, 'zh-tw', translationKey, slug);
    if (zhTwPost && zhTwPost.path) {
      return this.url_for('/' + String(zhTwPost.path).replace(/^\/+/, ''));
    }

    return this.url_for('/zh-tw/blog/');
  }

  return this.url_for(buildLocalizedPath(pathWithoutLang, lang));
});

hexo.extend.helper.register('bd_i18n', function (key, lang) {
  var targetLang = lang || currentLangFromContext(this);

  // ① 先吃 Hexo i18n（yml）
  var fromHexo = key;
  if (this && typeof this.__ === 'function') {
    fromHexo = this.__(key);
  }
  if (!fromHexo || fromHexo === key) {
    fromHexo = translateFromThemeI18n(key, targetLang);
  }
  if (fromHexo && fromHexo !== key) {
    return fromHexo;
  }

  // ② fallback 到 labels
  var table = labels[targetLang] || labels[siteDefaultLang()] || labels.en;
  if (table && table[key]) {
    return table[key];
  }

  // ③ 最後 fallback key
  return key;
});
 