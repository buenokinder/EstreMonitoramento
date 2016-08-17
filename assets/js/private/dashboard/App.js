var app = angular.module('DashboardModule', ['xeditable','ui.bootstrap',
    	'ngRoute','ngMaterial', 'lr.upload',
    	'ngResource','leaflet-directive','isteven-multi-select', 'ui.utils.masks', 'idf.br-filters', 'textAngular'
    	]);

 app.directive('onReadFile', function ($parse) {
	return {
		restrict: 'A',
		scope: false,
		link: function(scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);
            
			element.on('change', function(onChangeEvent) {
				var reader = new FileReader();
                
				reader.onload = function(onLoadEvent) {
					scope.$apply(function() {
						fn(scope, {$fileContent:onLoadEvent.target.result});
					});
				};

				reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
			});
		}
	};
});