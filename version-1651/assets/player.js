import { H as Hls } from './hls.js';

export function initMoviePlayer(source) {
  var root = document.querySelector('[data-player-root]');
  if (!root) {
    return;
  }

  var video = root.querySelector('video');
  var trigger = root.querySelector('[data-play-trigger]');
  var ready = false;
  var hls = null;

  function prepare() {
    if (ready || !video || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    ready = true;
  }

  function play() {
    prepare();
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
    video.setAttribute('controls', 'controls');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (trigger) {
    trigger.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!ready) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
