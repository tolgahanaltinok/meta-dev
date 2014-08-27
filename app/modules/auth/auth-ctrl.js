app.controller('loginCtrl', ['$scope', '$state', 'authService', '$http', function ($scope, $state, authService, $http) {
    $scope.login = function (userLogin) {
        $scope.responseLoginBool = false;

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
                    $scope.responseLoginMsg = errorResponse.data.error_description;             
                $scope.responseLoginBool = true;

            }
            else {
                $scope.errorMessage = "An error occured while performing this action. Please try after some time.";
            }
        });
    };
}])
.controller('registerCtrl', ['$scope', '$state', 'authService', function ($scope, $state, authService) {

    $scope.responseBool = false;
    $scope.modalShown = false;
    $scope.toggleModal = function () {
        $scope.modalShown = !$scope.modalShown;
    };


    $scope.passPattern = (function () {
        var regexp = /(?=^[!@#$%\^&*()_\-+=\[{\]};:<>|\./?a-zA-Z\d]{6,}$)(?=([!@#$%\^&*()_\-+=\[{\]};:<>|\./?a-zA-Z\d]*\W+){1,})[!@#$%\^&*()_\-+=\[{\]};:<>|\./?a-zA-Z\d]*$/;
        return {
            test: function (value) {
                if ($scope.requireTel === false) return true;
                else return regexp.test(value);
            }
        };
    })();


    $scope.htmlTooltipEmail = "Enter Valid Mail";
    $scope.htmlTooltipUserName = "Enter Valid UserName";
    $scope.htmlTooltipPassword = "Password must contain at least 1 non-letter, 1 uppercase letter and must be at least 6 characters";
    $scope.htmlTooltipConfirmPassword = "Confirm password should match password";
    $scope.usrRegister = {};

    $scope.register = function (userRegistration) {

        if (userRegistration == undefined) {

            console.log("No field filled");
            return;
        }

        if (userRegistration.Username === undefined || userRegistration.Password === undefined ||

            userRegistration.Email === undefined) {

            console.log("Complete all fields");

            return;
        }

        if (userRegistration.Password !== userRegistration.ConfirmPassword) {
            console.log("Passwords do not match");
            return;
        }

        if ($scope.checkTerms == false || $scope.checkTerms == undefined) {

            console.log("Terms not accepted");
            return;
        }

        $scope.errorMessage = '';

        authService.registerUser(userRegistration).$promise
        .then(function (data) {
            return authService.login({ userName: userRegistration.Username, password: userRegistration.Password }).$promise.then(function (data) {
                $state.go('main');
            });
        }).catch(function (error) {
            if (error.status === 400) {
                
                angular.forEach(error.data.ModelState, function (value, key) {
                    $scope.responseMsg = value;
                })
                $scope.responseBool = true;
               
                $scope.errorMessage = "Email already exists.";
            }
            else {
                $scope.errorMessage = "An error occured while performing this action. Please try after some time.";
            }
        });
    };


    $scope.goToLogin = function () {
        $state.go('login');
    }
}]);

