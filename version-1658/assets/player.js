(function () {
    function startPlayback(video, overlay, source) {
        var launch = function () {
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        };

        overlay.classList.add("is-hidden");
        video.controls = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (!video.src) {
                video.src = source;
            }
            launch();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!video.__hlsReady) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, launch);
                video.__hlsReady = true;
                video.__hlsInstance = hls;
            } else {
                launch();
            }
            return;
        }

        if (!video.src) {
            video.src = source;
        }
        launch();
    }

    document.addEventListener("DOMContentLoaded", function () {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector("[data-play-overlay]");
        var config = document.getElementById("player-config");

        if (!video || !overlay || !config) {
            return;
        }

        var payload = {};
        try {
            payload = JSON.parse(config.textContent || "{}");
        } catch (error) {
            payload = {};
        }

        var source = payload.source || "";
        if (!source) {
            return;
        }

        overlay.addEventListener("click", function () {
            startPlayback(video, overlay, source);
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback(video, overlay, source);
            }
        });
    });
})();
