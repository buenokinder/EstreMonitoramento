var app = angular.module('DashboardModule', ['xeditable',
    	'ngRoute','ngMaterial',
    	'ngResource','leaflet-directive','angularFileUpload'
    	]);


  app.controller("GeoJSONController", [ '$scope', '$http', function($scope, $http) {
    angular.extend($scope, {
        japan: {
            lat: -25.662848516904784,
            lng: -49.33949379634188,
             
            zoom: 15
        },
        defaults: {
            scrollWheelZoom: false
        }
    });

    // Get the countries geojson data from a JSON
    $http.get("/views/mapa/JPN.geo.json").success(function(data, status) {
        angular.extend($scope, {
            geojson: {
                data: data,
                style: {
                    fillColor: "green",
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                }
            }
        });
    });
}]);
