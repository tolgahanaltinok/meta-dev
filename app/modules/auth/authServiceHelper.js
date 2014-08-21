'use strict';

angular.module('metaTemp')
.factory('authServiceHelper', ['$http', '$resource','ngAuthSettings', function ($http, $resource,ngAuthSettings) {
    var baseUrl = ngAuthSettings.apiServiceBaseUri;
    var buildUrl = function (resourceUrl) {
        return baseUrl + resourceUrl;
    };

    return {
        AuthorizationToken: $resource(buildUrl("Token"), null,
        {
            requestToken: { method: 'POST', headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        }),
        AccountRegister: $resource(buildUrl('api/Account/Register'), null,
            {
                register: { method: 'post' }
            }),

        AccountLogOff: $resource(buildUrl('api/Account/Logout'), null,
            {
                logOff: { method: 'post' }
            })
    };
}]);

angular.module('metaTemp')
.factory('authorizationInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {
    return {
        responseError: function (rejection) {
            switch (rejection.status) {
                case 401: {
                    $state.go('login');
                    break;
                }
                case 403: {
                    $state.go('login');
                    break;
                }
                default: {
                    break;
                }
            }

            return $q.reject(rejection);
        }
    };
}]);

angular.module('metaTemp').directive('cstLoadingOverlay', ['$timeout', '$q', 'httpInterceptor', 'templateSvc', function ($timeout, $q, httpInterceptor, templateSvc) {
    var IS_HTML_PAGE =  /\.html$|\.html\?/i;
    var modifiedTemplates = {};

    return {
        restrict: 'E',
        templateUrl: '/Shared/loaderView.html',
        link: function (scope, element, attribute) {
            var requestQueue = [];
            httpInterceptor.request = function (config) {
                console.log('request: ' + config.url);
                requestQueue.push({});
                if (requestQueue.length == 1) {
                    showOverlay(element);
                }
                return config || $q.when(config);
            };
            httpInterceptor.response = function (response) {
                if (IS_HTML_PAGE.test(response.config.url)) {
                    if (!modifiedTemplates[response.config.url]) {
                        response.data = templateSvc.processTemplate(response);
                        modifiedTemplates[response.config.url] = true;
                    }
                }

                console.log('response: ' + response.config.url);
                requestQueue.pop();
                if (requestQueue.length === 0) {
                    $timeout(function () {
                        if (requestQueue.length === 0) {
                            hideOverlay(element);
                        }
                    }, 500);
                }
                return response || $q.when(response);
            };
            httpInterceptor.responseError = function (response) {
                requestQueue.pop();
                if (requestQueue.length === 0) {
                    $timeout(function () {
                        if (requestQueue.length === 0) {
                            hideOverlay(element);
                        }
                    }, 500);
                }
                return $q.reject(response);
            };
        }
    };

    function showOverlay(overlayDiv) {
        overlayDiv.removeClass('hide');
        overlayDiv.addClass('show');
    }

    function hideOverlay(overlayDiv) {
        overlayDiv.removeClass('show');
        overlayDiv.addClass('hide');
    }

}]);

angular.module('metaTemp').factory('httpInterceptor', function () {
    return {};
});



angular.module('metaTemp').service('templateSvc', ['$templateCache', function ($templateCache) {
    return {
        processTemplate: function (response) {
            var content = response.data;
            //var element = $('<div>').append(content);
            //content = element.html();
            $templateCache.put(response.config.url, content);
            return content;
        }
    };
}]);



