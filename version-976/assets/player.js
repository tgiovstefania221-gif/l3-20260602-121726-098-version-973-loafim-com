(function () {
  var hlsConstructorPromise = null;
  var scriptElement = document.currentScript;
  var hlsModuleUrl = scriptElement
    ? new URL('hls-vendor-dru42stk.js', scriptElement.src).href
    : 'assets/hls-vendor-dru42stk.js';

  function getHlsConstructor() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsConstructorPromise) {
      hlsConstructorPromise = import(hlsModuleUrl).then(function (module) {
        return module.H;
      }).catch(function () {
        return null;
      });
    }
    return hlsConstructorPromise;
  }

  function showMessage(shell, text) {
    var message = shell.querySelector('.player-message');
    if (!message) {
      message = document.createElement('div');
      message.className = 'player-message';
      message.style.position = 'absolute';
      message.style.left = '20px';
      message.style.right = '20px';
      message.style.bottom = '20px';
      message.style.padding = '12px 14px';
      message.style.borderRadius = '12px';
      message.style.color = '#fff';
      message.style.background = 'rgba(15, 23, 42, 0.88)';
      message.style.zIndex = '5';
      shell.appendChild(message);
    }
    message.textContent = text;
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('video[data-hls]');
    var button = shell.querySelector('[data-video-start]');
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute('data-hls');
    var initialized = false;

    function playVideo() {
      if (!source) {
        showMessage(shell, '当前影片暂未配置播放源。');
        return;
      }
      if (initialized) {
        video.play();
        shell.classList.add('is-playing');
        return;
      }
      initialized = true;
      showMessage(shell, '正在加载播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play();
        shell.classList.add('is-playing');
        return;
      }

      getHlsConstructor().then(function (Hls) {
        if (!Hls || !Hls.isSupported()) {
          showMessage(shell, '当前浏览器不支持 HLS 播放，请更换浏览器或开启媒体支持。');
          return;
        }
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
          shell.classList.add('is-playing');
          var message = shell.querySelector('.player-message');
          if (message) {
            message.remove();
          }
        });
        hls.on(Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            showMessage(shell, '视频加载失败，请检查网络或稍后再试。');
          }
        });
      });
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('[data-video-shell]').forEach(setupPlayer);
    });
  } else {
    document.querySelectorAll('[data-video-shell]').forEach(setupPlayer);
  }
})();
