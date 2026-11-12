if (window.Swup && !window.swup) {
  window.swup = new Swup({
    plugins: [
      new SwupScriptsPlugin({
        body: true,
        head: false,
      }),
    ],
    animationSelector: false,
  });
}

function enforceDefaultLangRoot() {
  var path = window.location.pathname || '';
  var trimmed = path.replace(/\/+$/, '');
  var guardKey = 'bd_swup_redirect_guard';
  var now = Date.now();
  var last = Number(sessionStorage.getItem(guardKey) || 0);

  if (last && now - last < 1200) {
    return false;
  }

  if (/\/BeforeDawn$/i.test(trimmed)) {
    if (trimmed.toLowerCase() === '/beforedawn/zh-tw') {
      return false;
    }
    sessionStorage.setItem(guardKey, String(now));
    window.location.replace('/BeforeDawn/zh-tw/');
    return true;
  }

  return false;
}

function isBlogDetailPath(pathname) {
  return /^\/BeforeDawn\/(zh-tw|en|it)\/blog\/(?!$|archives(?:\/|$)|categories(?:\/|$)|tags(?:\/|$)).+/i.test(pathname);
}

function toZhTwBlogPath(pathname) {
  return pathname.replace(/^\/BeforeDawn\/(zh-tw|en|it)\//i, '/BeforeDawn/zh-tw/');
}

window.bdHandleLangSwitch = function (selectEl) {
  if (!selectEl || !selectEl.value) return false;

  var targetHref = selectEl.value;
  var currentPath = window.location.pathname || '';

  if (!isBlogDetailPath(currentPath)) {
    window.location.href = targetHref;
    return false;
  }

  var targetUrl = new URL(targetHref, window.location.origin);
  var targetPath = targetUrl.pathname || '';
  var targetLangMatch = targetPath.match(/^\/BeforeDawn\/(zh-tw|en|it)\//i);
  var targetLang = targetLangMatch ? targetLangMatch[1].toLowerCase() : '';

  if (targetLang === 'zh-tw') {
    window.location.href = targetHref;
    return false;
  }

  fetch(targetPath, {
    method: 'GET',
    cache: 'no-store',
    credentials: 'same-origin'
  }).then(function (response) {
    if (response.ok) {
      window.location.href = targetHref;
      return;
    }

    var fallbackPath = toZhTwBlogPath(currentPath);
    if (fallbackPath === currentPath) return;
    window.location.href = fallbackPath;
  }).catch(function () {
    var fallbackPath = toZhTwBlogPath(currentPath);
    if (fallbackPath === currentPath) return;
    window.location.href = fallbackPath;
  });

  return false;
};

function initHome() {
  const home = document.querySelector("#home");
  if (!home) return;

  const video = home.querySelector(".home-video");

  if (video) {
    video.load();
    video.play?.().catch(() => {});
  }

  home.classList.remove("is-ready");
  void home.offsetWidth;
  home.classList.add("is-ready");
}

const mobileToggleSelector = '[data-mobile-toggle="hover-box"]';
const mobileToggleMediaQuery = window.matchMedia("(max-width: 767px)");

function syncMobileToggleTarget(box, isMobile = mobileToggleMediaQuery.matches) {
  if (isMobile) {
    box.setAttribute("role", "button");
    box.setAttribute("tabindex", "0");
    box.setAttribute(
      "aria-pressed",
      box.classList.contains("is-active") ? "true" : "false"
    );
    return;
  }

  box.classList.remove("is-active");
  box.removeAttribute("role");
  box.removeAttribute("tabindex");
  box.removeAttribute("aria-pressed");
}

function syncMobileToggleTargets(root = document) {
  root
    .querySelectorAll(mobileToggleSelector)
    .forEach((box) => syncMobileToggleTarget(box));
}

function toggleMobileToggleTarget(box) {
  box.classList.toggle("is-active");
  box.setAttribute(
    "aria-pressed",
    box.classList.contains("is-active") ? "true" : "false"
  );
}

if (!window.mobileToggleBound) {
  window.mobileToggleBound = true;

  document.addEventListener("click", (event) => {
    const toggleRoot = event.target.closest(mobileToggleSelector);
    if (!toggleRoot || !mobileToggleMediaQuery.matches) return;

    const interactiveChild = event.target.closest(
      "a, button, input, textarea, select, option, label, summary"
    );
    if (interactiveChild && interactiveChild !== toggleRoot) return;

    toggleMobileToggleTarget(toggleRoot);
  });

  document.addEventListener("keydown", (event) => {
    if (!mobileToggleMediaQuery.matches) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    const toggleRoot = event.target.closest(mobileToggleSelector);
    if (!toggleRoot) return;

    event.preventDefault();
    toggleMobileToggleTarget(toggleRoot);
  });

  const handleViewportChange = () => {
    syncMobileToggleTargets();
  };

  if (typeof mobileToggleMediaQuery.addEventListener === "function") {
    mobileToggleMediaQuery.addEventListener("change", handleViewportChange);
  } else if (typeof mobileToggleMediaQuery.addListener === "function") {
    mobileToggleMediaQuery.addListener(handleViewportChange);
  }
}

function initPage() {
  document.body.classList.remove("mobile-menu-open");

  if (typeof loadGallery === "function") {
    loadGallery();
  }

  initHome();
  syncMobileToggleTargets();

  if (typeof initMusicPlayers === "function") {
    initMusicPlayers();
  }
}

if (!window.mobileMenuBound) {
  window.mobileMenuBound = true;

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("#mobile-menu-toggle");
    const overlay = event.target.closest("#mobile-menu-overlay");
    const menuLink = event.target.closest("#mobile-menu a");

    if (toggle) {
      document.body.classList.toggle("mobile-menu-open");
      return;
    }

    if (overlay || menuLink) {
      document.body.classList.remove("mobile-menu-open");
    }
  });
}

document.addEventListener("DOMContentLoaded", initPage);

if (enforceDefaultLangRoot()) {
  // Stop bootstrapping when redirecting the root path.
}

if (window.swup?.hooks) {
  window.swup.hooks.on("page:view", initPage);
} else if (window.swup?.on) {
  window.swup.on("contentReplaced", initPage);
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});
