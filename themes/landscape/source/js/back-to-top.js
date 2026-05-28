(function () {
  function initBackToTop() {
    var button = document.getElementById('back-to-top');
    if (!button) return;
    var hiddenClass = 'is-hidden';

    var toggleVisibility = function () {
      button.classList.toggle(hiddenClass, window.scrollY <= 120);
    };

    if (!button.dataset.bound) {
      button.dataset.bound = 'true';
      button.addEventListener('click', function () {
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        window.scrollTo(0, 0);
      });

      window.addEventListener('scroll', toggleVisibility, { passive: true });
    }

    toggleVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackToTop);
  } else {
    initBackToTop();
  }

  if (window.swup && window.swup.hooks) {
    window.swup.hooks.on('page:view', initBackToTop);
  } else if (window.swup && window.swup.on) {
    window.swup.on('contentReplaced', initBackToTop);
  }
})();