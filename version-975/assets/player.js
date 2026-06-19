(function () {
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    onReady(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('[data-play]');
            var message = player.querySelector('.player-message');
            var stream = video ? video.getAttribute('data-stream') : '';
            var prepared = false;
            var hlsInstance = null;

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function prepare() {
                if (prepared || !video || !stream) {
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            setMessage('视频加载失败，请稍后再试');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }

                prepared = true;
            }

            function playVideo() {
                prepare();
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setMessage('点击视频控件即可开始播放');
                    });
                }
            }

            if (button && video) {
                button.addEventListener('click', function () {
                    playVideo();
                });
            }

            if (video) {
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                    setMessage('');
                });

                video.addEventListener('pause', function () {
                    if (!video.ended) {
                        player.classList.remove('is-playing');
                    }
                });

                video.addEventListener('error', function () {
                    setMessage('视频加载失败，请稍后再试');
                });
            }

            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
