'use strict';

angular.module('metaTemp').factory('authServiceHelper', ['$http', '$resource', function ($http, $resource) {
    var baseUrl = config.apiurl;
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
