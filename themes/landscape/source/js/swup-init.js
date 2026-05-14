if (!window.swup) {
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

function initPage() {
  document.body.classList.remove("mobile-menu-open");

  if (typeof loadGallery === "function") {
    loadGallery();
  }

  initHome();
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