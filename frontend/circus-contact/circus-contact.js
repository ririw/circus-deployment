app.controller("ContactController", ['$scope', '$location', function ($scope, $location) {
    $scope.gohire = function() {
        $location.path("/hire");
    }
}]);
