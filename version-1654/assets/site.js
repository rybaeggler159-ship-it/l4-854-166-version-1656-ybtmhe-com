(function() {
    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var links = document.querySelector(".nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function() {
            var opened = links.classList.toggle("open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function() {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var input = document.querySelector(".movie-search-input");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll(".filter-button"));
        var empty = document.querySelector(".no-results");
        var activeKind = "all";
        var activeValue = "all";

        if (!cards.length) {
            return;
        }

        function matchesFilter(card) {
            if (activeKind === "all") {
                return true;
            }
            var value = card.getAttribute("data-" + activeKind) || "";
            return value.indexOf(activeValue) !== -1;
        }

        function matchesSearch(card, query) {
            if (!query) {
                return true;
            }
            var haystack = card.getAttribute("data-search") || "";
            return haystack.toLowerCase().indexOf(query) !== -1;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var shown = 0;
            cards.forEach(function(card) {
                var visible = matchesSearch(card, query) && matchesFilter(card);
                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? "none" : "block";
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        buttons.forEach(function(button) {
            button.addEventListener("click", function() {
                buttons.forEach(function(item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                activeKind = button.getAttribute("data-filter-kind") || "all";
                activeValue = button.getAttribute("data-filter-value") || "all";
                apply();
            });
        });

        apply();
    }

    window.initMoviePlayer = function(sourceUrl) {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }

        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");
        var message = shell.querySelector(".player-message");
        var hls = null;
        var attached = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
            shell.classList.add("is-error");
        }

        function attach() {
            if (attached || !video) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function(eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        setMessage("视频加载失败，请稍后再试");
                    }
                });
                return;
            }

            setMessage("当前环境暂不支持播放");
        }

        function play() {
            attach();
            shell.classList.remove("is-error");
            if (overlay) {
                overlay.hidden = true;
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function() {
                    if (overlay) {
                        overlay.hidden = false;
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("play", function() {
                if (overlay) {
                    overlay.hidden = true;
                }
            });
            video.addEventListener("pause", function() {
                if (!video.ended && overlay) {
                    overlay.hidden = false;
                }
            });
            video.addEventListener("ended", function() {
                if (overlay) {
                    overlay.hidden = false;
                }
            });
        }

        window.addEventListener("pagehide", function() {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function() {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
