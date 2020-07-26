var
    scroll,
    heroSlider = $(".main-slider"),
    newsLetterForm = $("#newsletter-form"),
    progressBarIndex = 0,
    time = 1,
    tick,
    percentTime,
    emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    letters = /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/;

function isScrolledIntoView(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();
    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function scrollBarInit() {
    // Scrollbar.initAll();
    var scrollPosition = 0;
    // initial smooth-scrollbar
    scroll = Scrollbar.init(
        document.querySelector(".scroll-wrapper"), {
            syncCallbacks: true,
            alwaysShowTracks: true
        }
    );

    var prevscrollPosition = 0;
    scroll.addListener((status) => {
        scroll.setPosition(0, status.offset.y);
        scrollPosition = status.offset.y;

        if (scrollPosition >= 50){
            $("header").addClass("fixed");
            // $(".fx-cnt").addClass("container-fluid").removeClass('container');
            if (prevscrollPosition < scrollPosition) {
                $("header").removeClass("fixed-going-up");
                $("header").addClass("fixed-going-down");
            }
            else {
                $("header").removeClass("fixed-going-down");
                $("header").addClass("fixed-going-up");
            }
        }
        else {
            $("header").removeClass("fixed");
            // $(".fx-cnt").addClass("container").removeClass('container-fluid');
        }
        prevscrollPosition = scrollPosition;
    });
    $("#menu").on("click", "a", function (e) {
        e.preventDefault();
        y = $($(this).attr("href")).offset().top + scroll.offset.y;
        scroll.scrollTo(0, y, 1500);
    });

}

function animateElements() {
    if ($('.animate').length > 0) {
        $('.animate').bind('inview', function (event, isInView) {
            if (isInView) {
                var animate = $(this).attr('data-animation');
                var speedDuration = $(this).attr('data-duration');
                var $t = $(this);
                setTimeout(function () {
                    $t.addClass(animate + ' animated');
                }, speedDuration);
            }
        });
    }
}

function homeBannerInit() {
    if (heroSlider.length) {
        heroSlider
            .on('init', function (event, slick) {
                $(".slider-nav-slide").eq(0).addClass('active');
                if ($(slick.$slides[0]).find("iframe.short-video").length) {
                    var currentElem = slick.$slides[0];
                    if ($(currentElem).find(".short-video.html-video").length) {
                        $(currentElem).find(".short-video.html-video").get(0).play();
                        $(currentElem).find(".short-video.html-video").get(0).loop = true;
                    }
                }
            })
            .on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                $(".slider-nav-slide").removeClass('active');
                $(".slider-nav-slide").eq(nextSlide).addClass('active');
                heroSlider.find('.animate').off('inview');

                var currentElem = slick.$slides[nextSlide], $currentSlideElem = $(currentElem);
                var $elem = $currentSlideElem.find('.animate');

                if ($(slick.$slides[currentSlide]).find("iframe.short-video").length) {
                    var slickSlideVid = $(slick.$slides[currentSlide]).find(".short-video");
                    if (slickSlideVid.length) {
                        postMessageToPlayer(slickSlideVid.get(0), {
                            "event": "command",
                            "func": "mute"
                        });
                        postMessageToPlayer(slickSlideVid.get(0), {
                            "event": "command",
                            "func": "playVideo"
                        });
                    }
                } else {
                    if ($(currentElem).find(".short-video.html-video").length) {
                        $(currentElem).find(".short-video.html-video").get(0).play();
                        $(currentElem).find(".short-video.html-video").get(0).loop = true;
                    }
                    if ($(nextSlide).find(".short-video.html-video").length) {
                        $(currentElem).find(".short-video.html-video").get(0).stop();
                    }
                }
                $($elem).each(function (i, v) {
                    if ($(v).hasClass('animated')) {
                        $(v).removeClass('fadeInUp animated');
                        $(v).removeClass('fadeInLeft animated');
                        $(v).removeClass('fadeInRight animated');
                        $(v).removeClass('fadeInDown animated');
                    }
                    $(v).addClass('animate');
                });
                $currentSlideElem.find('.animate').each(function () {
                    $(this).bind('inview', function (event, isInView) {
                        if (isInView) {
                            var animate = $(this).attr('data-animation');
                            var speedDuration = $(this).attr('data-duration');
                            var $t = $(this);
                            setTimeout(function () {
                                $t.addClass(animate + ' animated');
                            }, speedDuration);
                        }
                    });
                });
                heroSlider.find('.animate').trigger('inview', [true]);
            })
            .on("afterChange", function (event, slick, currentSlide) {
                var slickSlideVid = $(slick.$slides[currentSlide]).find("iframe.short-video");
                if (slickSlideVid.length) {
                    postMessageToPlayer(slickSlideVid.get(0), {
                        "event": "command",
                        "func": "mute"
                    });
                    postMessageToPlayer(slickSlideVid.get(0), {
                        "event": "command",
                        "func": "playVideo"
                    });
                }
            })
            .slick({
                fade: true,
                accessibility: false,
                draggable: false,
                dots: false,
                infinite: true,
                nav: false,
                arrows: false,
                autoplay: false,
                speed: 300,
                cssEase: 'linear',
                autoplaySpeed: 1000,
                pauseOnHover: false,
                initialSlide: 1,
                responsive: [
                    {
                        breakpoint: 767.98,
                        settings: {
                            dots: true
                        }
                    }
                ]
            });
        setTimeout(function () {
            $(".slider-nav-slide").eq(0).click();
        }, 1000);
        $('.slider-nav-slide .nav-progressbar').each(function (index) {
            var progress = "<div class='inProgress inProgress" + index + "'></div>";
            $(this).html(progress);
        });

        function startProgressbar() {
            resetProgressbar();
            percentTime = 0;
            tick = setInterval(interval, 20);
        }

        function interval() {
            if ((heroSlider.find('.slick-track div[data-slick-index="' + progressBarIndex + '"]').attr("aria-hidden")) === "true") {
                progressBarIndex = heroSlider.find('.slick-track div[aria-hidden="false"]').data("slickIndex");
                startProgressbar();
            } else {
                percentTime += 1 / (time + 5);
                $('.inProgress' + progressBarIndex).css({
                    width: percentTime + "%"
                });
                if (percentTime >= 100) {
                    heroSlider.slick('slickNext');
                    progressBarIndex++;
                    if (progressBarIndex > 2) {
                        progressBarIndex = 0;
                    }
                    startProgressbar();
                }
            }
        }

        function resetProgressbar() {
            $('.inProgress').css({
                width: 0 + '%'
            });
            clearInterval(tick);
        }

        startProgressbar();

        $(".slider-nav-slide").click(function () {
            clearInterval(tick);
            var goToSlide = $(this).data("slide-num");
            heroSlider.slick("slickGoTo", goToSlide);
            startProgressbar();
        });

        $("body").on("click", ".banner-play-icon", function (e) {
            e.preventDefault();
            if ($(window).width() > 767) {
                if ($(this).closest(".home-slide").hasClass("playing")) {
                    if ($(this).closest(".home-slide").find(".long-video").length) {
                        var player = $(this).closest(".home-slide").find(".long-video").get(0);
                        postMessageToPlayer(player, {
                            "event": "command",
                            "func": "pauseVideo"
                        });
                        postMessageToPlayer(player, {
                            "event": "command",
                            "func": "mute"
                        });
                        startProgressbar();

                        $(this).closest(".home-slide").removeClass("playing");
                        $(this).closest(".home-slide").find(".long-video").fadeOut();
                        $(this).closest(".home-slide").find(".banner-hide-on-play").fadeIn();
                        $(".main-slider-thumb").fadeIn();
                    }
                }
                else {
                    if ($(this).closest(".home-slide").find(".long-video").length) {
                        $(".video-slider .item.playing .vslider-play-icon").click();

                        clearInterval(tick);
                        var player = $(this).closest(".home-slide").find(".long-video").get(0);
                        postMessageToPlayer(player, {
                            "event": "command",
                            "func": "playVideo"
                        });
                        postMessageToPlayer(player, {
                            "event": "command",
                            "func": "unMute"
                        });
                        $(this).closest(".home-slide").addClass("playing");
                        $(this).closest(".home-slide").find(".long-video").fadeIn();
                        $(this).closest(".home-slide").find(".banner-hide-on-play").fadeOut();
                        $(".main-slider-thumb").fadeOut();
                    }
                }
            } else {
                window.location.href = $(this).attr("href");
            }
        });

        $(".banner-video-overlay").on("click", function () {
            $(this).closest(".home-slide").find(".banner-play-icon").click();
        })
    }
}

function sameHeight() {
    var sameHeightGroup = [];
    $("[data-sameheight]").each(function () {
        var group = $(this).data("sameheight");
        if (!sameHeightGroup.includes(group)) {
            sameHeightGroup.push(group);
        }
    });

    $("[data-sameheight]").css("min-height", 0);

    setTimeout(function () {
        sameHeightGroup.forEach(function (group) {
            var mHeight = 0;
            var counter = 0;
            var totalCount = $("[data-sameheight='" + group + "']").length;
            $("[data-sameheight='" + group + "']").each(function () {
                counter++;
                if (mHeight < $(this).outerHeight()) {
                    mHeight = $(this).outerHeight();
                }
                if (counter == totalCount) {
                    $("[data-sameheight='" + group + "']").css("min-height", mHeight);
                }
            });
        });
    }, 1000);
}



$(document).ready(function () {

    $('.tab-head ul li a').click(function(){
        $('.tab-head ul li a').removeClass('active');
        $(this).addClass('active');
        var tagid = $(this).data('tag');
        $('.tab-innr').removeClass('active').addClass('hide');
        $('#'+tagid).addClass('active').removeClass('hide');
    });

    $('.popup-btn').click(function(){
        $('.blackout').fadeIn();
        $('.popup-01').fadeIn().addClass('active');
    });

    $('.popup-mn .btn.btn-primary').click(function(){
        $('.popup-01').fadeOut();
        $('.popup-02').fadeIn();
        setTimeout(function(){ 
            $('.popup-01').removeClass('active');
            $('.popup-02').addClass('active');
        }, 1000);
    });

    $('.popup-btn-close').click(function(){
        $('.popup-mn').removeClass('active');
        setTimeout(function(){ 
            $('.blackout').fadeOut();
            $('.popup-mn').fadeOut();
        }, 3000);
    });

   if (newsLetterForm.length) {
        newsLetterForm.formValidation({
            excluded: ':disabled',
            fields: {
                email: {
                    validators: {
                        notEmpty: {
                            message: ' '
                        }, regexp: {
                            regexp: emailRegex,
                            message: ' '
                        }
                    }
                },
                agreement: {
                    validators: {
                        notEmpty: {
                            message: ' '
                        }
                    }
                }
            },
            onSuccess: function (e) {
                e.preventDefault();
                var $form = $(e.target),
                    formId = '#' + $form[0].id;
                $(formId).addClass('loading').append('<div class="loader"></div>');
                $.ajax({
                    type: 'post',
                    url: ' ',
                    data: $(formId).serialize(),
                    success: function () {
                        setTimeout(function () {
                            var fields = $(formId).data('formValidation').getOptions().fields,
                                $parent, $icon;
                            for (var field in fields) {
                                $parent = $('[name="' + field + '"]').parents('.form-group');
                            }
                            // Then reset the form
                            $('.alert-success').addClass('in');
                            $(formId).data('formValidation').resetForm(true);
                            $("input[type=text], textarea").val("");
                            $('.file-input-name').hide();
                            $('.newsletter-thanks').slideDown();
                            $('.thanks').show();
                            $(formId).removeClass('loading');
                            $(formId).find('.loader').remove();
                            setTimeout(function () {
                                $('.newsletter-thanks').slideUp();
                                $('.thanks').hide();
                                $(formId).data('formValidation').resetForm(true);
                            }, 5000);
                        }, 1500);
                    }
                });
            }
        });
    }
    if ($(window).width() > 1199) {
        $('a.scroll-link[href*="#"]:not([href="#"])').click(function() {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html, body').animate({
                        scrollTop: (target.offset().top - 56)
                    }, 1000, "easeInOutExpo");
                    return false;
                }
            }
        });
    }

    // MENU TIMELINE START
    var tlPosition = 0;
    var menuBtnAnim = gsap.timeline({paused: true})
    menuBtnAnim.fromTo(".navigation-wrap", {y: '-100vh'}, {y: "0", duration: 0.25}, 0);
    menuBtnAnim.fromTo(".menu-list li",{opacity: 0, rotateX: 90}, {opacity: 1, rotateX: 0, duration: 0.25,  ease: Power0.easeNone}, 0);
    menuBtnAnim.fromTo(".close-menu-btn .line:nth-child(2)", {width: "0%", transformOrigin: 'center'}, {width: "100%", duration: 0.25}, 0.5);
    menuBtnAnim.fromTo(".close-menu-btn .line:nth-child(2)", {rotate: 0, transformOrigin: 'center'}, {rotate: -45, duration: 0.25}, 0.75);
    menuBtnAnim.fromTo(".close-menu-btn .line:nth-child(1)", {width: "0%", transformOrigin: 'center'}, {width: "100%", duration: 0.25}, 0.5);
    menuBtnAnim.fromTo(".close-menu-btn .line:nth-child(1)", {rotate: 0, transformOrigin: 'center'}, {rotate: 45, duration: 0.25}, 0.75);
    $('.menu-btn').on('click', function () {
        menuBtnAnim.play();
    });
    $('.close-menu-btn').on('click', function () {
        menuBtnAnim.reverse();
    });
    // MENU TIMELINE END

/*
    if($(".dotted-bg-img").length){
        var dotsAnim = gsap.timeline({yoyo: true, paused: false, repeat: -1}).timeScale(0.1);
        dotsAnim.fromTo(".dotted-bg-img", {autoAlpha: 0, duration: 1}, {autoAlpha: 1}, 0);
        dotsAnim.fromTo(".dotted-bg-img.purple", {autoAlpha: 1, duration: 1}, {autoAlpha: 0}, 0);
    }
*/

// grab all DIV elements in the document
    if($(".dotted-bg-img circle").length){
        let divs = document.querySelectorAll('.dotted-bg-img circle');
        const rand = (multi) => {
            return parseInt(multi * Math.random() ,10);
        }
        function move(){

            // loop over all DIV elements
            divs.forEach((div) => {
                // div.style.transition = (rand(100) + 900) + 'ms';

                var colorsArray = ["#C4C4C4", "#C4C4C4", "#dc4e40", "#5dc236"];
                // apply random colour
                div.style.fill = colorsArray[rand(50)];
            });
        }
        window.setInterval(move, 500);
    }
});

function isURL(str) {
    var path = window.location.pathname.toLowerCase();
    if (path.match(str.toLowerCase())) {
        return true;
    } else {
        return false;
    }
}

$(window).on('resize', function () {
    sameHeight();
});

$(window).on('load', function () {
    scrollBarInit();
    $(".loader-logo").fadeOut("slow");
    $("#loader-wrapper").css("transform", "translate(0,-100%)");
    $('html').addClass('loaded');
    homeBannerInit();
    animateElements();
    sameHeight();
    setTimeout(function () {
        scrollTo(0, -1);
    }, 0);
});

$(document).keydown(function (event) {
    if (event.ctrlKey == true && (event.which == '61' || event.which == '107' || event.which == '173' || event.which == '109' || event.which == '187' || event.which == '189')) {
        event.preventDefault();
    }
});

$(window).bind('mousewheel DOMMouseScroll', function (event) {
    if (event.ctrlKey == true) {
        event.preventDefault();
    }
});



if ($(window).width() < 767) {
    $('.tab-head ul').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        asNavFor: '.mbl-slidr',
        infinite: false,
    });

    $('.mbl-slidr').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.tab-head ul',
        dots: false,
        arrows: true,
        infinite: false,
        focusOnSelect: true
    });
}