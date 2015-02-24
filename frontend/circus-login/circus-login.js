app.controller("LoginController", ['$scope', '$location', '$http', '$mdToast', 'circ_login',
    function ($scope, $location, $http, $mdToast, circ_login) {
        $scope.login = function () {
            circ_login.login($scope.username, $scope.password);
        };

        $scope.loggedin = circ_login.loggedin;

        $scope.logout = circ_login.logout;
    }
]);