/* globals angular */
(function () {
    angular
        .module('cookiesMirror', []);
})();
/* globals angular */
(function () {
    cookiesMirrorInterceptorConfig.$inject = ['$httpProvider'];
    angular
        .module('cookiesMirror')
        .config(cookiesMirrorInterceptorConfig);

    /* @ngInject */
    function cookiesMirrorInterceptorConfig($httpProvider) {
        cookiesMirrorInterceptor.$inject = ['$q', '$cookiesMirror'];
        $httpProvider
            .interceptors
            .push(cookiesMirrorInterceptor);

        /* @ngInject */
        function cookiesMirrorInterceptor($q, $cookiesMirror) {
            return {
                'request': function (config) {
                    var cookies = $cookiesMirror.get(true);
                    if(cookies !== ''){
                        config.headers['Cookie'] = cookies;
                    }
                    return $q.when(config);
                },
                'requestError': function (rejection) {
                    return $q.reject(rejection);
                },
                'response': function (response) {
                    $cookiesMirror.parse(response.headers('set-cookie'));
                    return $q.when(response);
                },
                'responseError': function (rejection) {
                    return $q.reject(rejection);
                }
            };
        }
    }
})();
(function () {
    angular
        .module('cookiesMirror')
        .provider('$cookiesMirror', $cookiesMirrorProvider);

    /* @ngInject */
    function $cookiesMirrorProvider() {
        var $$localStorageIdentifier = 'cookiesMirror';
        var $$trackedCookies = [];
        var cookies = {};

        var $$restore = function () {
            var storage = window.localStorage.getItem($$localStorageIdentifier) || '{}';
            cookies = JSON.parse(storage);
        };

        var $$save = function () {
            window.localStorage.setItem($$localStorageIdentifier, JSON.stringify(cookies))
        };

        this.track = function () {
            $$restore();

            if (arguments.length === 1 && arguments[0] instanceof Array) {
                $$trackedCookies = arguments[0];
            }
            else {
                $$trackedCookies = arguments;
            }

            angular.forEach($$trackedCookies, function (cookieName) {
                if (!cookies.hasOwnProperty(cookieName)) {
                    cookies[cookieName] = '';
                }
            });

            $$save();
        };

        this.$get = $cookiesMirror;

        /* @ngInject */
        function $cookiesMirror() {
            return {
                get: $$get,
                parse: $$parse
            };

            function $$get(raw) {
                $$restore();
                if(!raw){
                    return cookies;
                }
                else{
                    var $$rawCookiesHeader = '';

                    angular.forEach(cookies, function(cookieValue, cookieName){
                        if(cookieValue !== ''){
                            $$rawCookiesHeader += (cookieName + '=' + cookieValue + '; ');
                        }
                    });

                    return $$rawCookiesHeader
                }
            }

            function $$parse(rawCookies) {
                if (rawCookies) {
                    var $$cookieValuesArray = undefined;

                    angular.forEach(cookies, function (cookieValue, cookieName) {
                        if (rawCookies.indexOf(cookieName + '=') > -1) {
                            $$cookieValuesArray = rawCookies.split(cookieName + '=');

                            $$cookieValuesArray.forEach(function (cookieValue) {
                                if (cookieValue != '') {
                                    cookies[cookieName] = cookieValue.split(';')[0];

                                    if(cookies[cookieName].indexOf('deleted') > -1){
                                        cookies[cookieName] = '';
                                    }
                                }
                            });

                            $$cookieValuesArray = undefined;
                        }
                    });

                    $$save();
                }
            }
        }
    }
})();
