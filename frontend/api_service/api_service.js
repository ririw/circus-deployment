app.factory('circ_login', [
    '$http', '$mdToast', '$location', 'config',
    function($http, $mdToast, $location, config) {
        var loginservice = {};

        if (localStorage.getItem('token') == null) localStorage.setItem('token', '');

        loginservice.get_token = function() { return localStorage.getItem('token'); };

        loginservice.login_check = function() {
            var token = localStorage.getItem('token');
            $http.get(config.base_url + "/authenticated?tok=" + token)
                .success(function(data, status) {
                })
                .error(function(data, status){
                    console.error(data, status);
                    localStorage.setItem('token', '');
                });
        };

        loginservice.loggedin = function() {
            return localStorage.getItem('token') != ''
        };

        loginservice.login = function(username, password){
            var request = {
                username: username,
                password: password
            };
            $http.post(config.base_url + "/login", request)
                .success(function(data, status) {
                    localStorage.setItem('token', data.token);
                    var toast = $mdToast.simple()
                        .content("Login successful!")
                        .position('bottom')
                        .hideDelay(2500);
                    $mdToast.show(toast);
                    $location.path('/');
                }).error(function(data, status) {
                    var message = undefined;
                    if (data.hasOwnProperty('error') && data.error == "Unknown username or password")
                        message = "invalid username or password";
                    else
                        message = "something went wrong";
                    var toast = $mdToast.simple()
                        .content(message)
                        .position('bottom')
                        .hideDelay(0);
                    $mdToast.show(toast);
                    console.error(data, status)
                })
        };

        loginservice.logout = function() {
            var token = localStorage.getItem('token');
            $http.post(config.base_url + "/logout?tok=" + token, {})
                .success(function(data, status) {
                    localStorage.setItem('token', data.token);
                    var toast = $mdToast.simple()
                        .content("Logout successful!")
                        .position('bottom')
                        .hideDelay(2500);
                    $mdToast.show(toast);
                    localStorage.setItem('token', '');
                    $location.path('/');
                }).error(function(data, status) {
                    var error = '';
                    if (data == null) {
                        error = 'Other'
                    } else {
                        error = data.hasOwnProperty('error') ? data.error : "other error";
                    }
                    var toast = $mdToast.simple()
                        .content("something went wrong: " + error)
                        .position('bottom')
                        .hideDelay(0);
                    $mdToast.show(toast);
                    localStorage.setItem('token', '');
                    console.error(data, status);
                });
            };

        loginservice.login_check();
        return loginservice;
    }
]);