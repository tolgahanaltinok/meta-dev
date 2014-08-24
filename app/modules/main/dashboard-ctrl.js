'use strict';

app.controller('dashboardCtrl', ['$scope', '$state', function ($scope, $state) {
	$state.go('main.dashboard.list');
  }]);
