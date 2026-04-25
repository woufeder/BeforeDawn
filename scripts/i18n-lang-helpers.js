'use strict';

function inferLangFromPath(path, fallback) {
  if (!path) return fallback;
  if (path.indexOf('/en/') !== -1 || path.indexOf('en/') === 0) return 'en';
  if (path.indexOf('/zh-tw/') !== -1 || path.indexOf('zh-tw/') === 0) return 'zh-tw';
  return fallback;
}

hexo.extend.helper.register('bd_current_lang', function() {
  var defaultLang = Array.isArray(this.config.language) ? this.config.language[0] : this.config.language;
  var pagePermalink = this.page && this.page.permalink ? this.page.permalink : '';
  var fromPermalink = inferLangFromPath(pagePermalink, '');
  if (fromPermalink) return fromPermalink;
  var pagePath = this.page && this.page.path ? this.page.path : '';
  return inferLangFromPath(pagePath, defaultLang);
});

hexo.extend.helper.register('bd_post_lang', function(post) {
  var defaultLang = Array.isArray(this.config.language) ? this.config.language[0] : this.config.language;

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
