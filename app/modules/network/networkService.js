'use strict';

app.factory('networkService',
    ['$http', 'ngAuthSettings',
        function ($http, ngAuthSettings) {

        var baseUrl = ngAuthSettings.apiServiceBaseUri;
        var buildUrl = function (resourceUrl) {
            return baseUrl + resourceUrl;
        };

        var networks = [
        {id:15,name:"Yazılım"},
        {id:11,name:"Tella"},
        {id:12,name:"Sanitag"},
        {id:13,name:"Arge Sunumları"},
        {id:14,name:"Sosyal"}
        ];


        var _getNetworks = function () {
            return $http.get(buildUrl('api/Networks')).then(function (results) {
                return results;
            });
        };
        var _getTopics = function () {
            return $http.get(buildUrl('api/Topics')).then(function (results) {
                return results;
            });
        }

        return{
            getNetworks: _getNetworks,
            getTopics : _getTopics
        }	
}]);
