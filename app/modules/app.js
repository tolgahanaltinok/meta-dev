'use strict';

angular.module('metaTemp', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router','ui.bootstrap'])
  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$provide',  
    function ($stateProvider, $urlRouterProvider, $httpProvider, $provide) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.useXDomain = true;

    $stateProvider
    	.state('login', {
	        url: '/login',
	        templateUrl: "/modules/auth/view/loginView.html",
	        controller: 'loginCtrl'
	    })
	    .state('register', {
	        url: '/register',
	        templateUrl: "/modules/auth/view/registerView.html",
	        controller: 'registerCtrl'
	    })
	    .state('main', {
  	    	url: "/main",
	        templateUrl: 'partials/main.html',
	        controller: 'mainCtrl'
	    })
      .state('main.dashboard', {
          url: '/dashboard',
          templateUrl: "/modules/main/views/dashboardView.html",
          controller: 'dashboardCtrl'
      })
      .state('main.dashboard.list', {
          url: '/list',
          templateUrl: "/modules/main/views/dashboard.listView.html"
      })
      .state('main.dashboard.balloon', {
          url: '/balloon',
          templateUrl: "/modules/main/views/dashboard.balloonView.html"
      })
      .state('main.network.list', {
          url: '/list',
          templateUrl: "/modules/network/views/network.listView.html"
      })
      .state('main.network.balloon', {
          url: '/balloon',
          templateUrl: "/modules/network/views/network.balloonView.html"
      })
      ;


    $urlRouterProvider.otherwise('/login');



    $httpProvider.interceptors.push('authorizationInterceptor');
    $httpProvider.interceptors.push('httpInterceptor');

}]).factory("userProfileSvc", function () {
    return {};
}).run(function($rootScope, $state,$stateParams, authService) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {
        if (toState.name !== "login" && toState.name !== "register") {
            if (!authService.isLoggedIn()) {
                event.preventDefault();
                $state.go('login');
            }
        }else{
          if (authService.isLoggedIn()) {
                event.preventDefault();
                $state.go('main');
            }
        }
    });
  });

  var serviceBase = 'http://tellawebapimig.azurewebsites.net/'; 
  
  angular.module('metaTemp').constant('ngAuthSettings', {
  	apiServiceBaseUri: serviceBase,
  });

  var app = angular.module('metaTemp');

