var app = angular.module('swiftCodeApp', ['ngRoute', 'ngCookies']);
var URL = "http://betsol.org:9000/";

//Routing

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            redirectTo: '/login'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'loginCtrl'
        })
        .when('/signup', {
            templateUrl: 'views/signup.html',
            controller: 'signupCtrl'
        })
        .when('/dashboard', {
            templateUrl: 'views/dashboard.html',
            controller: 'dashboardCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });

});


app.controller('signupCtrl', ['$scope', '$location', '$http', function($scope, $location, $http) {
    this.signupData = {};
    $scope.signup = function() {

        var request = $http({
            method: 'POST',
            url: URL + "signup",
            data: this.signupData
        });
        request.success(function(data) {
            var response = angular.fromJson(data);
            console.log(response);
            if (!response["error"]) {
                sessionStorage.userId = response["id"];
                sessionStorage.email = response["emal"];
                sessionStorage.password = response["password"];
                $location.path('/dashboard');
            } else {
                $scope.responseMessage = response["message"][0];
            }
        });
        request.error(function(data) {
            var response = angular.fromJson(data);
            console.log(response);
        });
    }

}]);

app.controller('loginCtrl', ['$scope', '$location', '$http', '$cookies', function($scope, $location, $http, $cookies) {

    var now = new Date();
    expDate = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

    console.log($cookies.get('email'));

    if ($cookies.get('email')) {
        $scope.email = $cookies.get('email');
        $scope.rememberMe = true;
    }

    $scope.login = function() {
        var request = $http({
            method: 'POST',
            url: URL + "login",
            data: {
                'email': $scope.email,
                'password': $scope.password
            }
        });

        request.success(function(data) {
            if ($scope.rememberMe) {
                $cookies.put('email', $scope.email, {
                    expires: expDate
                });
            } else {
                $scope.rememberMe = false;
                $cookies.remove('email');
            }


            var response = angular.fromJson(data);

            if (!response["error"]) {
                sessionStorage.userId = response["id"];
                sessionStorage.email = response["emal"];
                sessionStorage.password = response["password"];
                $location.path('/dashboard');
            } else {
                $scope.responseMessage = response["message"][0];
            }
            console.log(response);

        });
        request.error(function(data) {
            var response = angular.fromJson(data);
            console.log(response);
        });
    }
}]);


app.controller('dashboardCtrl', ['$scope', '$location', '$http', '$cookies', function($scope, $location, $http, $cookies) {
    $scope.getProfileData = function() {
        var request = $http({
            method: "GET",
            url: URL + "profile/" + sessionStorage.userId
        });
        request.success(function(data) {
            $scope.profileData = angular.fromJson(data);
        });
        request.error(function(data) {
            console.log(data);
        });
    }
    $scope.getProfileData();
    $scope.updateProfile = function() {
        delete this.profileData["connectionRequests"];
        delete this.profileData["connections"];
        delete this.profileData["suggestions"];
        var request = $http({
            method: "PUT",
            url: URL + "profile/" + sessionStorage.userId,
            crossDomain: true,
            data: this.profileData
        });
        request.success(function(data) {
            $scope.responseMessage = "Update successful.";
            $("#dashboardMsgModal").modal('show');
            $scope.getProfileData();
        });
        request.error(function(data) {
            console.log(data);
        });
    }

    $scope.sendConnectRequest = function(receiverId) {
        var request = $http({
            method: "POST",
            crossDomain: true,
            url: URL + "request/send/" + sessionStorage.userId + "/" + receiverId
        });
        request.success(function(data) {
            $scope.responseMessage = "Your request has been sent.";
            $("#dashboardMsgModal").modal('show');
            $scope.getProfileData();
        });
        request.error(function(data) {
            console.log(data);
        });
    }
    $scope.acceptConnectRequest = function(receiverId) {
        var request = $http({
            method: "POST",
            url: URL + "request/accept/" + receiverId
        });
        request.success(function(data) {
            $scope.responseMessage = "Request received ";
            $("#dashboardMsgModal").modal('show');
            $scope.getProfileData();
        });
        request.error(function(data) {
            console.log(data);
        });
    }

    $scope.logout = function() {
        sessionStorage.clear();
        $location.path("/login");
    }

}]);
