(function () {
    function boot(shell) {
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        if (!video || !cover) {
            return;
        }
        var url = video.getAttribute("data-video") || "";
        var started = false;
        var hls = null;

        function attach() {
            if (started || !url) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 60
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            shell.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }

        cover.addEventListener("click", play);
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (!video.currentTime) {
                shell.classList.remove("is-playing");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll(".video-shell").forEach(boot);
    });
}());
