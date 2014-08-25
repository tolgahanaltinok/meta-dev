'use strict';

app.controller('dashboardCtrl', ['$scope', '$stateParams', '$state', 'networkService', function ($scope, $stateParams, $state, networkService) {
    $scope.topics = [];

    networkService.getTopics()
            .then(function (results) {
                $scope.topics = results.data;
            }, function (error) {
                //alert(error.data.message);
            });
  }]);
