import { H as Hls } from './hls-vendor-dru42stk.js';

function initMoviePlayer() {
  const shell = document.querySelector('[data-player]');
  if (!shell) {
    return;
  }

  const video = shell.querySelector('video');
  const playButton = shell.querySelector('[data-play-button]');
  const message = shell.querySelector('[data-player-message]');
  const source = shell.getAttribute('data-video-src');
  let attached = false;
  let hlsInstance = null;

  function showMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function attachNativeSource() {
    video.src = source;
    attached = true;
    return Promise.resolve();
  }

  function attachHlsSource() {
    return new Promise((resolve, reject) => {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        attached = true;
        resolve();
      });

      hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
          return;
        }

        reject(new Error('播放失败，请稍后重试。'));
      });
    });
  }

  function attachSource() {
    if (attached) {
      return Promise.resolve();
    }

    if (!source) {
      return Promise.reject(new Error('当前影片暂时无法播放。'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      return attachNativeSource();
    }

    if (Hls && Hls.isSupported()) {
      return attachHlsSource();
    }

    return Promise.reject(new Error('当前浏览器不支持 HLS 播放。'));
  }

  async function play() {
    showMessage('');
    shell.classList.add('is-loading');

    try {
      await attachSource();
      await video.play();
      shell.classList.add('is-playing');
    } catch (error) {
      showMessage(error && error.message ? error.message : '播放失败，请刷新页面后重试。');
    } finally {
      shell.classList.remove('is-loading');
    }
  }

  if (playButton) {
    playButton.addEventListener('click', play);
  }

  video.addEventListener('play', () => {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', () => {
    if (!video.ended) {
      return;
    }
    shell.classList.remove('is-playing');
  });

  window.addEventListener('beforeunload', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

initMoviePlayer();
