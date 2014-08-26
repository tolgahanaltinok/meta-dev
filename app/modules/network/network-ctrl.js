'use strict';

app.controller('networkCtrl', ['$scope', '$stateParams', '$state', 'networkService', function ($scope, $stateParams, $state, networkService) {
    $scope.topics = [];

    networkService.getTopicsByNetwork($stateParams.networkId)
            .then(function (results) {
                $scope.topics = results.data;
            }, function (error) {
                //alert(error.data.message);
            });

    networkService.getUsersByNetwork($stateParams.networkId)
         .then(function (results) {
             $scope.userNetworkRelations = results.data;
         }, function (error) {
             //alert(error.data.message);
         });
}]);
