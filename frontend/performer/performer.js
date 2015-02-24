app.directive('performerCard', ['$http', 'config', function($http, config) {
    return {
        restrict: 'AE',
        templateUrl: 'performer/performer.html',
        scope: {
            performerId: '@'
        },
        controller: ['$scope', '$element', '$attrs', '$transclude', '$http', '$location',
            function($scope, $element, $attrs, $transclude, $http, $location) {
            $scope.image_ix = 0;
            $scope.current_image = function(){
                if ($scope.performer)
                    return $scope.performer.other_pictures[$scope.image_ix % $scope.performer.other_pictures.length];
                else return null;
            };
            $scope.profile_picture = function() {
                if ($scope.performer)
                    return $scope.performer.profile_picture;
                else return null;
            };
            $scope.next_image = function(){
                $scope.image_ix = $scope.image_ix + 1;
                if ($scope.image_ix >= $scope.performer.other_pictures.length) $scope.image_ix = 0;
            };
            $scope.prev_image = function(){
                $scope.image_ix = $scope.image_ix - 1;
                if ($scope.image_ix < 0) $scope.image_ix = $scope.performer.other_pictures.length - 1;
            };
            $scope.gohire = function() {
                $location.path("/hire");
            };
        }],
        link: function (scope, element, attrs) {
            $http.get(config.base_url + '/performer/' + scope.performerId)
                .success(function (data, status) {
                    scope.performer = Performer(data);
                })
                .error(function (data, status) {
                    console.error(data)
                });
        }
    }
}]);

function Performer(data) {
    return {
        id: data['id'],
        name: data['name'],
        skills: data['skills'],
        profile_picture: data['profile_picture'],
        other_pictures: data['other_pictures'],
        shown: data['shown']
    }
}