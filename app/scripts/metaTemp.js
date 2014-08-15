'use strict';

angular.module('metaTemp', ['ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize', 'ngResource', 'ui.router','ui.bootstrap'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: "/",
        templateUrl: 'partials/main.html',
        controller: 'MainCtrl'
      });

    $urlRouterProvider.otherwise("/");
  })
;
