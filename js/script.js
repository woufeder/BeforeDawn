(function($){
  var shareMessages = {
    'zh-tw': {
      copy: '複製連結',
      copied: '已複製文章網址',
      copyFailed: '複製失敗，請手動複製',
      instagramReady: '已複製文章網址，請貼到 Instagram',
      share: '分享文章'
    },
    en: {
      copy: 'Copy link',
      copied: 'Link copied',
      copyFailed: 'Copy failed, please copy it manually',
      instagramReady: 'Link copied, paste it into Instagram',
      share: 'Share article'
    },
    it: {
      copy: 'Copia link',
      copied: 'Link copiato',
      copyFailed: 'Copia non riuscita, copialo manualmente',
      instagramReady: 'Link copiato, incollalo su Instagram',
      share: 'Condividi articolo'
    }
  };

  var shareLocale = (document.documentElement.lang || 'zh-tw').toLowerCase();
  var shareText = shareMessages[shareLocale] || shareMessages[shareLocale.split('-')[0]] || shareMessages['zh-tw'];

  var setShareFeedback = function($box, message, isError){
    $box.find('.article-share-feedback')
      .text(message)
      .toggleClass('is-error', !!isError);
  };

  var fallbackCopyText = function(text){
    var $tempInput = $('<input type="text" class="article-share-temp-input">').val(text).appendTo('body');
    $tempInput.trigger('select');
    var copied = false;

    try {
      copied = document.execCommand('copy');
    } catch (err) {
      copied = false;
    }

    $tempInput.remove();
    return copied;
  };

  var copyShareUrl = function(text){
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function(){
        return true;
      }).catch(function(){
        return fallbackCopyText(text);
      });
    }

    return Promise.resolve(fallbackCopyText(text));
  };

  // Search
  var $searchWrap = $('#search-form-wrap'),
    isSearchAnim = false,
    searchAnimDuration = 200;

  var startSearchAnim = function(){
    isSearchAnim = true;
  };

  var stopSearchAnim = function(callback){
    setTimeout(function(){
      isSearchAnim = false;
      callback && callback();
    }, searchAnimDuration);
  };

  $('.nav-search-btn').on('click', function(){
    if (isSearchAnim) return;

    startSearchAnim();
    $searchWrap.addClass('on');
    stopSearchAnim(function(){
      $('.search-form-input').focus();
    });
  });

  $('.search-form-input').on('blur', function(){
    startSearchAnim();
    $searchWrap.removeClass('on');
    stopSearchAnim();
  });

  // Share
  $('body').on('click', function(){
    $('.article-share-box.on').removeClass('on');
  }).on('click', '.article-share-link', function(e){
    e.preventDefault();
    e.stopPropagation();

    var $this = $(this),
      url = $this.attr('data-url'),
      encodedUrl = encodeURIComponent(url),
      id = 'article-share-box-' + $this.attr('data-id'),
      title = $this.attr('data-title'),
      offset = $this.offset();

    if ($('#' + id).length){
      var box = $('#' + id);

      if (box.hasClass('on')){
        box.removeClass('on');
        return;
      }
    } else {
      var html = [
        '<div id="' + id + '" class="article-share-box" role="dialog" aria-label="' + shareText.share + '">',
          '<input class="article-share-input" value="' + url + '" readonly>',
          '<div class="article-share-links">',
            '<button type="button" class="article-share-copy" title="' + shareText.copy + '" aria-label="' + shareText.copy + '"><span class="fa-solid fa-link"></span></button>',
            '<a href="https://www.facebook.com/sharer.php?u=' + encodedUrl + '" class="article-share-box-link article-share-facebook" target="_blank" rel="noopener" title="Facebook"><span class="fa-brands fa-facebook-f"></span></a>',
            '<a href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodedUrl + '" class="article-share-box-link article-share-twitter" target="_blank" rel="noopener" title="Twitter"><span class="fa-brands fa-twitter"></span></a>',
            '<a href="https://social-plugins.line.me/lineit/share?url=' + encodedUrl + '" class="article-share-box-link article-share-line" target="_blank" rel="noopener" title="LINE"><span class="fa-brands fa-line"></span></a>',
            '<a href="https://www.instagram.com/" class="article-share-box-link article-share-instagram" target="_blank" rel="noopener" title="Instagram"><span class="fa-brands fa-instagram"></span></a>',
          '</div>',
          '<div class="article-share-feedback" aria-live="polite"></div>',
        '</div>'
      ].join('');

      var box = $(html);

      $('body').append(box);
    }

    $('.article-share-box.on').removeClass('on');

    box.css({
      top: offset.top + 25,
      left: offset.left
    }).addClass('on');

    setShareFeedback(box, '');
    box.find('.article-share-input').trigger('focus').trigger('select');
  }).on('click', '.article-share-box', function(e){
    e.stopPropagation();
  }).on('click', '.article-share-input', function(){
    $(this).select();
  }).on('click', '.article-share-copy', function(e){
    e.preventDefault();
    e.stopPropagation();

    var $box = $(this).closest('.article-share-box'),
      text = $box.find('.article-share-input').val();

    copyShareUrl(text).then(function(copied){
      setShareFeedback($box, copied ? shareText.copied : shareText.copyFailed, !copied);
    });
  }).on('click', '.article-share-box-link', function(e){
    e.preventDefault();
    e.stopPropagation();

    var $link = $(this);

    if ($link.hasClass('article-share-instagram')) {
      var $box = $link.closest('.article-share-box'),
        text = $box.find('.article-share-input').val(),
        windowName = 'article-share-box-window-' + Date.now();

      copyShareUrl(text).then(function(copied){
        setShareFeedback($box, copied ? shareText.instagramReady : shareText.copyFailed, !copied);
        window.open($link.attr('href'), windowName, 'width=500,height=700');
      });
      return;
    }

    window.open(this.href, 'article-share-box-window-' + Date.now(), 'width=500,height=450');
  });

  // Caption
  $('.article-entry').each(function(i){
    $(this).find('img').each(function(){
      if ($(this).parent().hasClass('fancybox') || $(this).parent().is('a')) return;

      var alt = this.alt;

      if (alt) $(this).after('<span class="caption">' + alt + '</span>');

      $(this).wrap('<a href="' + this.src + '" data-fancybox=\"gallery\" data-caption="' + alt + '"></a>')
    });

    $(this).find('.fancybox').each(function(){
      $(this).attr('rel', 'article' + i);
    });
  });

  if ($.fancybox){
    $('.fancybox').fancybox();
  }

  // Mobile nav
  var $container = $('#container'),
    isMobileNavAnim = false,
    mobileNavAnimDuration = 200;

  var startMobileNavAnim = function(){
    isMobileNavAnim = true;
  };

  var stopMobileNavAnim = function(){
    setTimeout(function(){
      isMobileNavAnim = false;
    }, mobileNavAnimDuration);
  }

  $('#main-nav-toggle').on('click', function(){
    if (isMobileNavAnim) return;

    startMobileNavAnim();
    $container.toggleClass('mobile-nav-on');
    stopMobileNavAnim();
  });

  $('#wrap').on('click', function(){
    if (isMobileNavAnim || !$container.hasClass('mobile-nav-on')) return;

    $container.removeClass('mobile-nav-on');
  });
})(jQuery);