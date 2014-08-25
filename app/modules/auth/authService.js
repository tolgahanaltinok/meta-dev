'use strict';

angular.module('metaTemp')
  .factory('authService',
    ['$http','authServiceHelper','$cookieStore',
        function ($http, authServiceHelper, $cookieStore) {

    var Token = authServiceHelper.AuthorizationToken;
    var AccountRegister = authServiceHelper.AccountRegister;
    var AccountLogOff = authServiceHelper.AccountLogOff;

    var CurrentUser = { id: '0', username: '', name: '', surname: '' };
    var userData = { 
      isAuthenticated: false,
      username: '',
      bearerToken: '',
      expirationDate: null,
    };

    var isAuthenticationExpired = function(expirationDate) {
      var now = new Date();
      expirationDate = new Date(expirationDate);
      if (expirationDate - now > 0) {
        return false;
      } else {
        return true;
      }
    }

    var saveData = function() {
      removeData();
      $cookieStore.put('auth_data', userData);
    }

    var removeData = function() {
      $cookieStore.remove('auth_data');
    }

    var retrieveSavedData = function() {
      var savedData = $cookieStore.get('auth_data');
      if (typeof savedData === 'undefined') {
        clearUserData();
      } else {
        userData = savedData;
        setHttpAuthHeader();
      }
    }

    var clearUserData = function() {
      userData.isAuthenticated = false;
      userData.username = '';
      userData.bearerToken = '';
      userData.expirationDate = null;
    }

    var setHttpAuthHeader = function() {
      $http.defaults.headers.common.Authorization = 'Bearer ' + userData.bearerToken;
    }

    var isAuthenticated = function() {
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

    var buildFormData = function (formData) {
        var dataString = '';
        for (var prop in formData) {
            if (formData.hasOwnProperty(prop)) {
                dataString += (prop + '=' + formData[prop] + '&');
            }
        }
        return dataString.slice(0, dataString.length - 1);
    };

    return {
        login: function (userLogin) {
            var formData = { Username: userLogin.userName, Password: userLogin.password, grant_type: 'password' };
            return Token.requestToken(buildFormData(formData), function (data) {
                  userData.isAuthenticated = true;
                  userData.username = data.userName;
                  userData.bearerToken = data.access_token;
                  userData.expirationDate = new Date(data['.expires']);

                  setHttpAuthHeader();

                  if (userLogin.persistData === true) {
                    saveData();
                  }
            });
        },
        registerUser: function (userRegistration) {
            var registration = AccountRegister.register(userRegistration);
            return registration;
        },
        logOffUser: function () {
            AccountLogOff.logOff();
            $http.defaults.headers.common.Authorization = undefined;
            CurrentUser = { id: '0',username: '', name: '',surname: ''};
        },
        getCurrentUser : function(){
            return CurrentUser;
        },
        setCurrentUser: function(user) {
                CurrentUser = user ;
        },
        isLoggedIn: isAuthenticated
    };
}]);