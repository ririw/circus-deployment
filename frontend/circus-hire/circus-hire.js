app.controller("HireController", ['$scope', '$location', '$http', '$mdToast', 'config',
    function ($scope, $location, $http, $mdToast, config) {
    $scope.skills = [
        {name: 'acrobalance or acrobatics', price: 800},
        {name: 'fire twirling', price: 500},
        {name: 'juggling', price: 300},
        {name: 'balloon twisting', price: 300},
        {name: 'stilt-walking', price: 300},
        {name: 'other'}
    ];
    $scope.show_price = false;

    $scope.hire_request = {
        email: null,
        location: null,
        skills: {}
    };

    var skill_prices = {};
    for (ii = 0; ii < $scope.skills.length; ii++) {
        if ('price' in $scope.skills[ii])
            skill_prices[$scope.skills[ii].name] = $scope.skills[ii].price
    }

    $scope.price = function() {
        var price = 200;
        $scope.show_price = Object.keys($scope.hire_request.skills).length > 0;
        for (var key in $scope.hire_request.skills) {
            if ($scope.hire_request.skills.hasOwnProperty(key)) {
                if (key == 'other') $scope.show_price = false;
                if (key in skill_prices) price += skill_prices[key];
            }
        }
        return price;
    };

    $scope.toggleSelection = function(name) {
        if (name in $scope.hire_request.skills) {
            delete $scope.hire_request.skills[name];
        } else {
            $scope.hire_request.skills[name] = true
        }
    };

    $scope.gohire = function() {
        if ($scope.hireform.$valid) {
            $scope.send_hire_request()
        } else {
            var toast =$mdToast.simple()
                .content('We need a valid email address to be able to contact you')
                .position('bottom')
                .hideDelay(5000);
            $mdToast.show(toast)
        }
    };
    $scope.send_hire_request = function() {
        var request = {
            email: $scope.hire_request.email,
            location: $scope.hire_request.location,
            skills: []
        };
        for (skill in $scope.hire_request.skills) {
            if ($scope.hire_request.skills.hasOwnProperty(skill)) {
                request.skills.push(skill);
            }
        }
        $http.put(config.base_url + "/hire", request)
        .success(
            function(data, status){
                var toast = $mdToast.simple()
                    .content('Thanks! We\'ll get back to you soon')
                    .position('bottom')
                    .action('Meet the performers')
                    .hideDelay(0);
                $mdToast.show(toast).then(function() {
                    $location.path("/artists");
                });
            }
        ).error(
            function(data, status) {
                var toast = $mdToast.simple()
                    .content('Something went wrong.')
                    .position('bottom')
                    .action('Contact us here')
                    .hideDelay(0);
                $mdToast.show(toast).then(function() {
                    $location.path("/contact");
                });
                console.error(data, status)
            }
        )


    }
}]);
