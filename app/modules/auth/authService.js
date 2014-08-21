'use strict';

angular.module('metaTemp')
  .service('authService', ['$http', '$cookieStore','authServiceHelper', 
    function User($http, $cookieStore, authServiceHelper) {
    
    var Token = authServiceHelper.AuthorizationToken;
    var AccountRegister = authServiceHelper.AccountRegister;
    var AccountLogOff = authServiceHelper.AccountLogOff;

    var userData = {
      isAuthenticated: false,
      username: '',
      bearerToken: '',
      expirationDate: null,
    };

    
    function NoAuthenticationException(message) {
      this.name = 'AuthenticationRequired';
      this.message = message;
    }

    function NextStateUndefinedException(message) {
      this.name = 'NextStateUndefined';
      this.message = message;
    }

    function AuthenticationExpiredException(message) {
      this.name = 'AuthenticationExpired';
      this.message = message;
    }

    function AuthenticationRetrievalException(message) {
      this.name = 'AuthenticationRetrieval';
      this.message = message;
    }

    function isAuthenticationExpired(expirationDate) {
      var now = new Date();
      expirationDate = new Date(expirationDate);
      if (expirationDate - now > 0) {
        return false;
      } else {
        return true;
      }
    }

    function saveData() {
      removeData();
      $cookieStore.put('auth_data', userData);
    }

    function removeData() {
      $cookieStore.remove('auth_data');
    }

    function retrieveSavedData() {
      var savedData = $cookieStore.get('auth_data');
      if (typeof savedData === 'undefined') {
        clearUserData();
      } else {
        userData = savedData;
        setHttpAuthHeader();
      }
    }

    function clearUserData() {
      userData.isAuthenticated = false;
      userData.username = '';
      userData.bearerToken = '';
      userData.expirationDate = null;
    }

    function setHttpAuthHeader() {
      $http.defaults.headers.common.Authorization = 'Bearer ' + userData.bearerToken;
    }

    this.isAuthenticated = function() {
      if (userData.isAuthenticated) {
        return true;
      } else {
          retrieveSavedData();
          if (!isAuthenticationExpired(userData.expirationDate)) {
            return true;
          }
          return false;
      }
    };

    this.getUserData = function(){
      return userData;
    };

    this.removeAuthentication = function() {
      removeData();
      clearUserData();
      $http.defaults.headers.common.Authorization = null;
    };

    this.authenticate = function(username, password, persistData) {
      this.removeAuthentication();
      var data = 'grant_type=password&username=' + username + '&password=' + password;

      return Token
        .requestToken(data, function (data) {
          userData.isAuthenticated = true;
          userData.username = data.userName;
          userData.bearerToken = data.access_token;
          userData.expirationDate = new Date(data['.expires']);

          setHttpAuthHeader();

          if (persistData === true) {
            saveData();
          }
          
        });
    };

    this.registerUser = function (userRegistration) {
        var registration = AccountRegister.register(userRegistration);
        return registration;
    };
    this.logOffUser = function () {
        this.removeAuthentication();
    };

  }]);
