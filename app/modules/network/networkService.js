'use strict';

app.factory('networkService',
    ['$http', 'ngAuthSettings',
        function ($http, ngAuthSettings) {

            var baseUrl = ngAuthSettings.apiServiceBaseUri;
            var buildUrl = function (resourceUrl) {
                return baseUrl + resourceUrl;
            };

            var networks = [
            { id: 15, name: "Yazılım" },
            { id: 11, name: "Tella" },
            { id: 12, name: "Sanitag" },
            { id: 13, name: "Arge Sunumları" },
            { id: 14, name: "Sosyal" }
            ];


            var _getNetworks = function () {
                return $http.get(buildUrl('api/Networks')).then(function (results) {
                    return results;
                });
            };

            var _getUsersInDomainNetwork = function () {
                return $http.get(buildUrl('api/Users/DomainNetwork')).then(function (results) {
                    return results;
                });
            };
            var _getUsersByNetwork = function (networkId) {
                return $http.get(buildUrl('api/Networks/' + networkId + '/Users')).then(function (results) {
                    return results;
                });
            };

            var _getTopicsByNetwork = function (networkId) {
                return $http.get(buildUrl('api/Networks/' + networkId + '/Topics')).then(function (results) {
                    return results;
                });
            };

            var _getTopics = function () {
                return $http.get(buildUrl('api/Topics')).then(function (results) {
                    return results;
                });
            }

            var _putTopic = function (topic) {
                var data = new Object();
                data = topic;
                return $http.put(serviceBase + 'api/Tasks/'+data.Id, data).then(function (results) {
                    return results;
                });
            }

            return {
                getNetworks: _getNetworks,
                getTopics: _getTopics,
                getUsersInDomainNetwork: _getUsersInDomainNetwork,
                getUsersByNetwork: _getUsersByNetwork,
                getTopicsByNetwork: _getTopicsByNetwork,
                putTopic : _putTopic

            }
        }]);
