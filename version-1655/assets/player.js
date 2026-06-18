(function () {
  const shell = document.querySelector(".player-shell");
  if (!shell) {
    return;
  }

  const video = shell.querySelector("video");
  const cover = shell.querySelector(".player-cover");
  const stream = shell.getAttribute("data-stream");
  let ready = false;
  let hls = null;

  const prepare = function () {
    if (ready || !video || !stream) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = stream;
    ready = true;
  };

  const play = function () {
    prepare();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  };

  if (cover) {
    cover.addEventListener("click", play);
  }

  shell.addEventListener("click", function (event) {
    if (event.target === shell) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });

  video.addEventListener("error", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
    ready = false;
  });
})();
