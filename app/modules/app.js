'use strict';

angular.module('metaTemp', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router','ui.bootstrap'])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

  	$locationProvider.html5Mode(true);

    $stateProvider
    	.state('login', {
	        url: '/login',
	        templateUrl: "/modules/view/loginView.html",
	        controller: 'loginCtrl'
	    })
	    .state('register', {
	        url: '/register',
	        templateUrl: "/modules/view/registerView.html",
	        controller: 'registerCtrl'
	    })
	    .state('main', {
	    	url: "/",
	        templateUrl: 'partials/main.html',
	        controller: 'mainCtrl'
	    });

    $urlRouterProvider.otherwise("/");

    
  })
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

  var serviceBase = 'http://ngauthenticationapi.azurewebsites.net/'; 
  
  angular.module('metaTemp').constant('ngAuthSettings', {
  	apiServiceBaseUri: serviceBase,
  });

