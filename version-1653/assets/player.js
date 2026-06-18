(function () {
  var containers = document.querySelectorAll('[data-player]');

  containers.forEach(function (container) {
    var video = container.querySelector('video');
    var trigger = container.querySelector('[data-play]');
    var started = false;
    var hls = null;

    function start() {
      if (!video) {
        return;
      }

      var source = video.getAttribute('data-stream');

      if (!source) {
        return;
      }

      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }

        started = true;
      }

      container.classList.add('is-playing');

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('play', function () {
        container.classList.add('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
