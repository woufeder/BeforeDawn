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
    tags: 'Tags',
    recent_posts: 'Recent Posts',
    search: 'Search',
    rss_feed: 'RSS Feed',
    share: 'Share'
  },
  'zh-tw': {
    home: '首頁',
    about: '關於',
    original: '原創',
    project: '作品',
    music: '音樂',
    others: '其他',
    blog: '部落格',
    archives: '文章存檔',
    categories: '分類',
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

function inferLangFromPath(path, fallback) {
  if (!path) return fallback;
  if (path.indexOf('/en/') !== -1 || path.indexOf('en/') === 0) return 'en';
  if (path.indexOf('/zh-tw/') !== -1 || path.indexOf('zh-tw/') === 0) return 'zh-tw';
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

function currentLangFromContext(context) {
  var defaultLang = siteDefaultLang();
  var pagePermalink = context.page && context.page.permalink ? context.page.permalink : '';
  var fromPermalink = inferLangFromPath(pagePermalink, '');
  if (fromPermalink) return fromPermalink;
  var pagePath = context.page && context.page.path ? context.page.path : '';
  return inferLangFromPath(pagePath, defaultLang);
}

hexo.extend.helper.register('bd_current_lang', function() {
  return currentLangFromContext(this);
});

hexo.extend.helper.register('bd_post_lang', function(post) {
  var defaultLang = siteDefaultLang();

  if (!post) return defaultLang;
  if (post.lang) return post.lang;
  if (post.language) return post.language;

  var found = null;
  var targetId = post._id ? String(post._id) : '';
  var targetSource = post.source || '';

  this.site.posts.each(function(item) {
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

hexo.extend.helper.register('bd_url_for_lang', function(targetPath, lang) {
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

  if (normalized.indexOf('/en/') === 0 || normalized.indexOf('/zh-tw/') === 0) {
    return this.url_for(normalized);
  }

  return this.url_for('/' + targetLang + normalized);
});

hexo.extend.helper.register('bd_label', function(key, lang) {
  var targetLang = lang || currentLangFromContext(this);
  var table = labels[targetLang] || labels[siteDefaultLang()] || labels.en;
  return table[key] || key;
});
