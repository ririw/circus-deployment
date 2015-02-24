app.controller("ArtistsController", ['$scope', '$http', '$timeout', 'config',
    function ($scope, $http, $timeout, config) {
        $http.get(config.base_url + '/performers')
            .success(function(data, status){
                $scope.artists = data;
                $timeout(function () {
                    var msnry = new Masonry('#container', {
                        // options
                        columnWidth: '.performer',
                        itemSelector: '.performer'
                    });
                }, 300);
            })
            .error(function(data, status){console.error(data)});
    $scope.artists = [];
}]);
