'use strict';

angular.module('metaTemp')
  .controller('mainCtrl', function ($scope) {
  })
  .controller('loginCtrl', ['$scope', '$state', 'authService','$http', function ($scope, $state, authService,$http) {
$scope.login = function (userLogin) {
        $scope.errorMessage = '';
        authService.login(userLogin).$promise
        .then(function (data) {
            $state.go('main');
        }).catch(function (errorResponse) {
            if (errorResponse.status == 404) {
                $scope.errorMessage = errorResponse.data;
            }
            if (errorResponse.status === 400) {
                $scope.errorMessage = "Invalid Email/Password";
            }
            else {
                $scope.errorMessage = "An error occured while performing this action. Please try after some time.";
            }
        });
    };
  }])
  .controller('registerCtrl', ['$scope', '$state', 'authService', function ($scope, $state, authService) {
    $scope.register = function (userRegistration) {
        if (userRegistration.password !== userRegistration.confirmPassword) {
            console.log( "Passwords do not match");
            return;
        }

        $scope.errorMessage = '';
        var deferred = $q.defer();
        authService.registerUser(userRegistration).success(function (data) {
            return authService.login({ userName: userRegistration.userName, password: userRegistration.password }).$promise
            .then(function (data) {
                $state.go('home');
            });
        }).catch(function (error) {
            if (error.status === 400) {
                $scope.errorMessage = "Email already exists.";
            }
            else {
                $scope.errorMessage = "An error occured while performing this action. Please try after some time.";
            }
        });
    };
  }])
