'use strict';

app.controller('mainCtrl', ['$scope', '$state', 'networkService', '$cookieStore', 'authService', function ($scope, $state, networkService, $cookieStore, authService) {

    $scope.networks = [];

    networkService.getNetworks()
            .then(function (results) {
                $scope.networks = results.data;
            }, function (error) {
                //alert(error.data.message);
            });

    console.log($state);

    if($state.is("main")){
        $state.go("main.dashboard.list");
        console.log($state.is("main"));
    }
    
    $scope.calculateFixedSidebarViewportHeight = function () {
        var sidebarHeight = $(window).height() - $('.header').height() + 1;
        if ($('body').hasClass("page-footer-fixed")) {
            sidebarHeight = sidebarHeight - $('.footer').height();
        }

        return sidebarHeight; 
    }

    $scope.logOut = function () {
        $cookieStore.remove("auth_data");
        authService.logOffUser();
        $state.go('login');
    }

  }])
