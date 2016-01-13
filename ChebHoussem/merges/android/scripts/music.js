var myapp = angular.module('musicApp', ['mobiscroll-listview', 'mobiscroll-form', 'mobiscroll-widget', 'mobiscroll-slider']);

myapp.controller('musicController', ['$scope', '$compile', '$timeout', function ($scope, $compile, $timeout) {
    var audio,
        currentIndex = 0,
        messageTimer,
        randomIndex = 0,
        message = $('#message');

    $scope.showHiddenPlayer = false;
    $scope.started = true;
    $scope.showPlayer = false;
    $scope.showPause = false;
    $scope.timeUpdate = true;
    $scope.theme = $.mobiscroll.defaults.theme = MS.theme;
    $scope.repeat = false;
    $scope.shuffle = false;
    $scope.like = false;
    $scope.music = [{
        artist: 'Cheb Houssem',
        img: '/img/h.png',
        track: "Tiamo Tiamo",
        audio: 'sounds/Tiamo_Tiamo.mp3',
        length: "11:14",
        startTime: '0',
        currTime: '0:00'
    }, {
        artist: 'Cheb Houssem',
        img: '/img/h1.png',
        track: "Semhili Ya Ma",
        audio: 'sounds/Semhili_Ya_Ma.mp3',
        length: "11:12",
        startTime: '0',
        currTime: '0:00'
    }, {
        artist: 'Cheb Houssem',
        img: '/img/h1.png',
        track: "Sayi M3ak Manzid ",
        audio: 'sounds/Sayi_M3ak_Manzid.mp3',
        length: "7:45",
        startTime: '0',
        currTime: '0:00'
    }, {
        artist: 'Cheb Houssem',
        img: '/img/h.png',
        track: "Ana Sbabi Bouha",
        audio: 'sounds/Ana_Sbabi_Bouha.mp3',
        length: "17:51",
        startTime: '0',
        currTime: '0:00'
    }
    ];

    $scope.currentItem = $scope.music[currentIndex];
    $scope.currentItem.sliderVal = 0;

    $scope.listviewOptions = {
        swipe: false,
        enhance: true,
        theme: $scope.theme,
        altRow: true,
        onItemTap: function (item, index) {
            $scope.$apply(function () {
                if (index !== currentIndex) {
                    changeTrack(index);
                    currentIndex = index;
                } else {
                    $scope.currentItem.status = 'play';
                }

                $timeout(function () {
                    $scope.showPlayer = true;
                    $scope.started = false;
                    //$location.search('player', 'full');
                    window.location.hash = 'modal=Player';
                }, 100);

            });
        }
    };

    $scope.widgetOptions = {
        display: 'modal',
        buttons: [],
        context: MS.context1,
        theme: $scope.theme,
        animate: 'pop'
    };

    $scope.onBackPress = function () {
        //$location.search('player', 'list');
        window.history.back();
    };

    $scope.onPictureTap = function () {
        $scope.showPlayer = true;
        window.location.hash = 'modal=Player';
        //$location.search('player', 'full');
    };

    $scope.notify = function (text) {
        $scope.message = text;

        clearTimeout(messageTimer);

        message.show();

        if (message.hasClass('music-message-v')) {
            message.removeClass('music-message-v');
            messageTimer = setTimeout(function () {
                message.addClass('music-message-v');
            }, 200);
        } else {
            message.addClass('music-message-v');
        }

        messageTimer = setTimeout(function () {
            message.removeClass('music-message-v');
            messageTimer = setTimeout(function () {
                message.hide();
            }, 200);
        }, 2000);
    };

    $scope.sliderChange = function (percent) {
        audio.currentTime = audio.duration ? percent * audio.duration / 100 : 0;
    };

    $scope.toggleShuffle = function () {
        $scope.shuffle = !$scope.shuffle;
        $scope.notify('Shuffle ' + ($scope.shuffle ? 'on' : 'off'));
    };

    $scope.toggleLike = function () {
        $scope.currentItem.like = !$scope.currentItem.like;
        $scope.notify('Music ' + ($scope.currentItem.like ? 'liked' : 'disliked'));
    };

    $scope.toggleRepeat = function () {
        $scope.repeat = !$scope.repeat;
        $scope.notify('Repeat ' + ($scope.repeat ? 'on' : 'off'));
    };

    $scope.$watch('currentItem.status', function (nv) {
        switch (nv) {
            case 'play':
                if (audio.paused) {
                    audio.play();
                    $scope.showPause = true;
                } else {
                    changeTrack(currentIndex);
                }
                break;
            case 'pause':
                if (!audio.paused) {
                    audio.pause();
                    $scope.showPause = false;
                }
                break;
            case 'next':
                nextMusic();
                break;
            case 'prev':
                nextMusic(true);
                break;
            case 'stop':
                stopMusic();
                $scope.showPause = false;
                break;
        }
    });

    function stopMusic() {
        audio.load();
        $scope.currentItem.currTime = "0:00";
        $scope.currentItem.sliderVal = 0;
        $scope.hideListPlayer = true;
    }

    function nextMusic(prev) {
        $scope.currentItem.currTime = "0:00";
        $scope.currentItem.sliderVal = 0;

        if ($scope.shuffle) {
            while (randomIndex == currentIndex) {
                randomIndex = Math.floor(Math.random() * ($scope.music.length));
            }
            currentIndex = randomIndex;
        } else if (prev) {
            currentIndex = $scope.repeat && currentIndex === 0 ? $scope.music.length - 1 : Math.max(--currentIndex, 0);
        } else {
            currentIndex = $scope.repeat && currentIndex === $scope.music.length - 1 ? 0 : Math.min(++currentIndex, $scope.music.length - 1);
        }

        changeTrack(currentIndex);
    }

    function changeTrack(index) {
        $scope.started = false;
        $timeout(function () {
            $scope.currentItem.status = '';
            $scope.currentItem = $scope.music[index];
            $scope.currentItem.currTime = "0:00";
            $scope.currentItem.sliderVal = 0;
            audio.currentTime = 0;
            audio.src = $scope.currentItem.audio;
            audio.play();
            $scope.showPause = true;
            $scope.currentItem.status = 'play';
        }, 60);
    }

    audio = new Audio($scope.currentItem.audio);
    audio.type = "audio/mp3";
    audio.preload = 'auto';

    // Listen for audio events
    $(audio).on('timeupdate', function () {
        var d = new Date(audio.currentTime * 1000),
            sec = d.getSeconds();

        if (!$scope.started) {
            $scope.started = true;
        }

        if ($scope.timeUpdate) {
            $scope.$apply(function () {
                $scope.currentItem.sliderVal = audio.currentTime * 100 / audio.duration;
                $scope.currentItem.currTime = d.getMinutes() + ":" + (sec < 10 ? '0' + sec : sec);
            });
        }
    }).on('ended', function () {
        if ($scope.currentItem.status != 'pause') {
            nextMusic();
        }
    });

    // Listen for hashchange
    $(window).on('hashchange', function () {
        $scope.$apply(function () {
            $scope.showPlayer = window.location.hash.replace('#', '') == 'modal=Player';
        });
    });

    //$scope.$watch(function () {
    //    return $location.search();
    //}, function (value) {
    //    if (value.player == 'full') {
    //        $scope.showPlayer = true;
    //    } else {
    //        $scope.showPlayer = false;
    //    }
    //}, true);

    $timeout(function () {
        // remove the slider step markup
        $('.mbsc-slider-step').remove();
    }, 500);

    $scope.changeTheme = function (theme) {
        $scope.theme = $.mobiscroll.defaults.theme = theme;

        $('.music-control').trigger('mbsc-enhance');

        $timeout(function () {
            $scope.listviewOptions.theme = theme;

            $scope.widgetOptions.theme = theme;
            $scope.widgetInstance = $('.music-social-cont').mobiscroll().widget($scope.widgetOptions).mobiscroll('getInst');

            $('.music-detail-cont').mobiscroll('destroy');
            $('.music-control').mobiscroll('destroy');

            $('.music-progress').mobiscroll().slider({
                theme: $scope.theme,
                live: false
            });

            $('.music-detail-cont').mobiscroll().form({
                theme: $scope.theme
            });

            $('.music-control').mobiscroll().form({
                theme: $scope.theme
            });

            $('#musiclist').mobiscroll().listview($scope.listviewOptions);
        }, 100);
    };

}]);

myapp.directive('onSliderTouch', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.on('touchstart mousedown', function () {
                scope.$apply(function () {
                    scope.timeUpdate = false;
                });
            });

            $(document).on('touchend mouseup', function () {
                scope.$apply(function () {
                    scope.timeUpdate = true;
                });
            });
        }
    };
});

myapp.directive('noScroll', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.on('touchstart touchmove', function (ev) {
                ev.preventDefault();
            });
        }
    };
});

myapp.directive('musicPlayer', function () {
    return {
        restrict: 'E',
        templateUrl: 'music-player.html'
    };
});


$(function () {
   
    $('#theme').change(function () {
        var scope = angular.element('html').scope();
        scope.changeTheme($(this).val(), scope.theme);
    });
});

$(window).on('load', function () {
    $('.wrapper').removeClass('loading');
});
