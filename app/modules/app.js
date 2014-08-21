'use strict';

angular.module('metaTemp', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router','ui.bootstrap'])
  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider','$provide',  
    function ($stateProvider, $urlRouterProvider, $httpProvider,$provide) {

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
	    	url: "/",
	        templateUrl: 'partials/main.html',
	        controller: 'mainCtrl'
	    });

    $urlRouterProvider.otherwise("/");

	$httpProvider.interceptors.push('authorizationInterceptor');
	 $httpProvider.interceptors.push('httpInterceptor');
    
  }])
  .run(function($rootScope, $state, authService) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, error) {
		if (toState.name !== "login" && toState.name !== "register") {
            if (!authService.isAuthenticated()) {
                event.preventDefault();
                $state.go('login');
            }
        }
    });
  });

  var serviceBase = 'http://localhost:16516/'; 
  
  angular.module('metaTemp').constant('ngAuthSettings', {
  	apiServiceBaseUri: serviceBase,
  });

