var myDirectives_ngTouch = angular.module('myDirectives_ngTouch', []);

/*
ngTouchstart
not official part of angularjs 1.4.4 - so manualy added here:
code mostly copied from
https://github.com/angular/angular.js/blob/g3_v1_4/src/ng/directive/ngEventDirs.js
http://stackoverflow.com/a/32238039/574981
*/
myDirectives_ngTouch.directive('ngTouchstart', [
    '$parse',
function($parse) { return {
    restrict: 'A',
    compile: function($element, attr) {
        var fn = $parse(
            // attr['ngTouchstart'],
            attr.ngTouchstart,
            /* interceptorFn */ null,
            /* expensiveChecks */ true
        );
        return function ngEventHandler(scope, element) {
            element.on('touchstart', function(event) {
                var callback = function() {
                    fn(scope, {$event:event});
                };
                scope.$apply(callback);
            });
          };
    }
};}
]);
