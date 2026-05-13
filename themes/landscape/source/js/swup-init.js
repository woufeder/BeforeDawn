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
  if (typeof loadGallery === "function") {
    loadGallery();
  }

  initHome();
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