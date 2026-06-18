import { H as Hls } from './hls-vendor.js';

document.querySelectorAll('[data-hls-player]').forEach(function (player) {
  var video = player.querySelector('video');
  var button = player.querySelector('[data-play-button]');
  var status = player.querySelector('[data-player-status]');
  var source = player.getAttribute('data-video-src');
  var hls = null;
  var initialized = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function initializePlayer() {
    if (initialized || !video || !source) {
      return;
    }

    initialized = true;

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('HLS 播放清单已加载');
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络异常，正在重新加载');
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体异常，正在恢复播放');
          hls.recoverMediaError();
          return;
        }

        setStatus('播放器初始化失败');
        hls.destroy();
      });
      setStatus('HLS 播放器已初始化');
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('使用浏览器原生 HLS 播放');
    } else {
      setStatus('当前浏览器不支持 HLS 播放');
    }
  }

  if (button) {
    button.addEventListener('click', function () {
      initializePlayer();
      player.classList.add('is-playing');
      video.play().catch(function () {
        setStatus('请再次点击播放器开始播放');
      });
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      initializePlayer();
      player.classList.add('is-playing');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
