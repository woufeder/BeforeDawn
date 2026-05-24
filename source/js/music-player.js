(function () {
  const playerSelector = "[data-music-player]";
  const loadedClass = "is-loaded";
  const playingClass = "is-playing";

  function formatTime(value) {
    const totalSeconds = Math.max(0, Math.floor(Number(value) || 0));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const two = (number) => String(number).padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${two(minutes)}:${two(seconds)}`;
    }

    return `${two(minutes)}:${two(seconds)}`;
  }

  function getDuration(player, audio) {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      return audio.duration;
    }

    return Number(player.dataset.duration) || 0;
  }

  function updateTimeElement(element, seconds) {
    if (!element) return;
    element.textContent = formatTime(seconds);
    element.setAttribute("datetime", `PT${Math.max(0, Math.floor(seconds || 0))}S`);
  }

  function setRangeFill(range, value, max) {
    const percentage = max > 0 ? (Number(value) / max) * 100 : 0;
    range.style.setProperty("--progress", `${Math.min(Math.max(percentage, 0), 100)}%`);
  }

  function setAudioTime(audio, seconds) {
    audio.currentTime = seconds;
  }

  function waitForMetadata(audio) {
    if (audio.readyState >= 1) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      audio.addEventListener("loadedmetadata", resolve, { once: true });
      audio.addEventListener("error", reject, { once: true });
    });
  }

  function syncPlayer(player) {
    const audio = player.querySelector("audio");
    const progress = player.querySelector("[data-player-progress]");
    const current = player.querySelector("[data-player-current]");
    const duration = player.querySelector("[data-player-duration]");
    const total = getDuration(player, audio);

    updateTimeElement(current, audio.currentTime);

    if (duration) {
      duration.textContent = formatTime(total);
    }

    if (progress) {
      progress.max = total || 0;
      progress.value = audio.currentTime || 0;
      setRangeFill(progress, progress.value, total);
    }
  }

  function syncRangeFill(range, value) {
    if (!range) return;
    range.style.setProperty("--progress", `${value}%`);
  }

  function ensureAudio(player) {
    const audio = player.querySelector("audio");
    if (!audio.src) {
      player.audioLoadPromise =
        player.audioLoadPromise ||
        fetch(player.dataset.audioSrc)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Audio request failed: ${response.status}`);
            }

            return response.blob();
          })
          .then((blob) => {
            if (player.dataset.objectUrl) {
              URL.revokeObjectURL(player.dataset.objectUrl);
            }

            player.dataset.objectUrl = URL.createObjectURL(blob);
            audio.src = player.dataset.objectUrl;
          })
          .catch(() => {
            audio.src = player.dataset.audioSrc;
          })
          .then(() => {
            audio.load();
            player.classList.add(loadedClass);
            return waitForMetadata(audio).catch(() => {});
          })
          .then(() => {
            syncPlayer(player);
            return audio;
          });

      return player.audioLoadPromise;
    }

    return Promise.resolve(audio);
  }

  function pauseOtherPlayers(activePlayer) {
    document.querySelectorAll(playerSelector).forEach((player) => {
      if (player === activePlayer) return;

      const audio = player.querySelector("audio");
      if (!audio || audio.paused) return;

      audio.pause();
    });
  }

  async function seekBy(player, seconds) {
    const audio = await ensureAudio(player);
    seekToTime(player, (audio.currentTime || 0) + seconds);
  }

  async function togglePlayback(player) {
    const audio = await ensureAudio(player);

    if (audio.paused) {
      pauseOtherPlayers(player);
      audio.play().catch(() => {
        player.classList.remove(playingClass);
      });
      return;
    }

    audio.pause();
  }

  async function seekToTime(player, seconds) {
    const audio = await ensureAudio(player);
    const applySeek = () => {
      const total = getDuration(player, audio);
      const nextTime = Math.min(Math.max(Number(seconds) || 0, 0), total || Infinity);
      setAudioTime(audio, nextTime);
      syncPlayer(player);
    };

    if (audio.readyState >= 1) {
      applySeek();
    } else {
      player.dataset.pendingSeek = String(seconds);
      waitForMetadata(audio).then(applySeek).catch(() => {});
    }
  }

  function seekToProgress(player, progress) {
    seekToTime(player, Number(progress.value));
  }

  function bindPlayer(player) {
    if (player.dataset.musicPlayerReady === "true") return;
    player.dataset.musicPlayerReady = "true";

    const audio = player.querySelector("audio");
    const volume = player.querySelector("[data-player-volume]");

    if (volume) {
      audio.volume = Number(volume.value);
      syncRangeFill(volume, Number(volume.value) * 100);
    }

    audio.addEventListener("play", () => {
      player.classList.add(playingClass);
      const button = player.querySelector("[data-player-action='toggle']");
      if (button) {
        button.setAttribute("aria-label", button.getAttribute("aria-label").replace(/^播放/, "暫停"));
      }
    });

    audio.addEventListener("pause", () => {
      player.classList.remove(playingClass);
      const button = player.querySelector("[data-player-action='toggle']");
      if (button) {
        button.setAttribute("aria-label", button.getAttribute("aria-label").replace(/^暫停/, "播放"));
      }
    });

    audio.addEventListener("timeupdate", () => syncPlayer(player));
    audio.addEventListener("loadedmetadata", () => {
      if (player.dataset.pendingSeek) {
        seekToTime(player, Number(player.dataset.pendingSeek));
        delete player.dataset.pendingSeek;
        return;
      }

      syncPlayer(player);
    });
    audio.addEventListener("durationchange", () => syncPlayer(player));
    audio.addEventListener("ended", () => {
      player.classList.remove(playingClass);
      syncPlayer(player);
    });

    syncPlayer(player);
  }

  function initMusicPlayers(root) {
    (root || document).querySelectorAll(playerSelector).forEach(bindPlayer);
  }

  if (!window.musicPlayerEventsBound) {
    window.musicPlayerEventsBound = true;

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-player-action]");
      if (!button) return;

      const player = button.closest(playerSelector);
      if (!player) return;

      const action = button.dataset.playerAction;
      if (action === "toggle") togglePlayback(player);
      if (action === "backward") seekBy(player, -10);
      if (action === "forward") seekBy(player, 10);
    });

    document.addEventListener("input", (event) => {
      const volume = event.target.closest("[data-player-volume]");
      if (volume) {
        const player = volume.closest(playerSelector);
        const audio = player.querySelector("audio");
        audio.volume = Number(volume.value);
        syncRangeFill(volume, Number(volume.value) * 100);
        return;
      }

      const progress = event.target.closest("[data-player-progress]");
      if (progress) {
        const player = progress.closest(playerSelector);
        seekToProgress(player, progress);
      }
    });

    document.addEventListener("change", (event) => {
      const progress = event.target.closest("[data-player-progress]");
      if (!progress) return;

      const player = progress.closest(playerSelector);
      seekToProgress(player, progress);
    });
  }

  window.initMusicPlayers = initMusicPlayers;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initMusicPlayers());
  } else {
    initMusicPlayers();
  }
})();
