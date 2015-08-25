/******************************************************************************

    ShapePusher directive

    written by stefan krueger (s-light),
        mail@s-light.eu, http://s-light.eu, https://github.com/s-light/

    changelog / history
        see git commits

    TO DO:
        ~ enjoy your life :-)

******************************************************************************/

/******************************************************************************

    Copyright 2015 Stefan Krueger

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

******************************************************************************/

var myDirectivesShapePusher = angular.module('myDirectivesShapePusher', [
    // 'myDirectivesArrays',
    // 'myDirectivesInput',
]);

// get current script path
// http://stackoverflow.com/a/21103831/574981
// var scripts = document.getElementsByTagName("script");
// var myDTl_scriptPath = scripts[scripts.length-1].src;
var myDTl_scriptElement = document.querySelector(
    "[src*=myDirectivesShapePusher]"
);
var myDTl_scriptPath = myDTl_scriptElement.getAttribute('src');
var myDTl_templateURL = myDTl_scriptPath.replace('.js', '.html');


// capture the Enter-Key on an element and calls a function
// loosly based on
//      https://gist.github.com/EpokK/5884263
//      https://docs.angularjs.org/guide/directive
//      http://stackoverflow.com/a/26756027/574981
myDirectivesShapePusher.directive('shapepusher', [
    '$parse',
    '$timeout',
    '$filter',
function($parse, $timeout, $filter) { return {
    restrict: 'A',
    // require: 'ngModel',
    // transclude: true,
    scope: {
        data: '=',
        itemActive: '=',
        selected: '=',
        itemSize: '=',
    },
    // template: '<ul class="tagslist"></ul>',
    // templateUrl: 'js/myDirectivesShapePusher.html',
    // templateUrl: myDTl_templateURL,
    templateUrl: function() {
        // only for development!!!!!
        // this disables the caching of the template file..
        // console.log("shapepusher");
        // console.log("myDTl_scriptPath:", myDTl_scriptPath);
        return myDTl_templateURL + '?' + new Date();
    },
    link: function(scope, element, attr, ctrl) {
        // console.log("directive date");
        // console.log("scope", scope);
        // console.log("element", element);
        // console.log("attrs", attrs);
        // console.log("ctrl", ctrl);

        // console.log("itemSize", scope.itemSize);


        // shapepusher_data: {
        //     world: {
        //         width: 10,
        //         height: 8,
        //         grid: {
        //             visible: true,
        //             numbers: true,
        //         }
        //     },
        //     items: [
        //         {
        //             id: 'a1',
        //             position: {
        //                 x: 1,
        //                 y: 1,
        //             },
        //         },
        //         {
        //             id: 'a2',
        //             position: {
        //                 x: 1,
        //                 y: 2,
        //             },
        //         },
        //     ],
        // };

        // item:{
        //     id: 'a1',
        //     position: {
        //         x: 1,
        //         y: 1,
        //     },
        //     selected:false,
        //     active:false,
        // };

        scope.toggleSelection = function(item) {
            // console.group("toggleSelection");
            // console.log("item", item);
            // console.log("scope.itemActive", scope.itemActive);
            // toggle with 1 & 0
            if (item.selected) {
                // currently selected

                if (scope.itemActive != item) {
                    // set last selected item as active
                    scope.itemActive = item;
                } else {
                    item.selected = 0;
                    // item.selected = false;
                    // remove active
                    scope.itemActive = null;
                }

            } else {
                // currently unselected

                item.selected = 1;
                // item.selected = true;
                scope.itemActive = item;

            }
            // console.log("item", item);
            // console.log("scope.itemActive", scope.itemActive);
            // console.groupEnd();
        };

        // currentTranslate

        // watch example/info http://stackoverflow.com/a/15113029/574981
        // watch deep
        scope.$watch(
            function(){
                return scope.data.items;
            },
            function() {
                // console.log("Taglist watch fired.");
                // scope.selected = $filter('filter')(scope.sourcelist, {selected:'true'});
                scope.selected = $filter('filter')(scope.sourcelist, {selected:'1'});
            },
            true
        );

    }
};}]);
