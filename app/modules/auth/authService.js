'use strict';

angular.module('metaTemp')
  .service('authService', ['$http', '$cookieStore', function User($http, $cookieStore) {
    

    var userData = {
      isAuthenticated: false,
      username: '',
      bearerToken: '',
      expirationDate: null,
    };

    
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
        throw new AuthenticationRetrievalException('No authentication data exists');
      } else if (isAuthenticationExpired(savedData.expirationDate)) {
        throw new AuthenticationExpiredException('Authentication token has already expired');
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
      if (userData.isAuthenticated && !isAuthenticationExpired(userData.expirationDate)) {
        return true;
      } else {
        try {
          retrieveSavedData();
        } catch (e) {
          throw new NoAuthenticationException('Authentication not found');
        }
        return true;
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

    this.authenticate = function(username, password, successCallback, errorCallback, persistData) {
      this.removeAuthentication();
      var config = {
        method: 'POST',
        url: 'http://192.168.1.44:42042/token',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: 'grant_type=password&username=' + username + '&password=' + password,
      };

      $http(config)
        .success(function(data) {
          userData.isAuthenticated = true;
          userData.username = data.userName;
          userData.bearerToken = data.access_token;
          userData.expirationDate = new Date(data['.expires']);
          setHttpAuthHeader();
          if (persistData === true) {
            saveData();
          }
          if (typeof successCallback === 'function') {
            successCallback();
          }
        })
        .error(function(data) {
          if (typeof errorCallback === 'function') {
            if (data.error_description) {
              errorCallback(data.error_description);
            } else {
              errorCallback('Unable to contact server; please, try again later.');
            }
          }
        });
    };
  }]);
