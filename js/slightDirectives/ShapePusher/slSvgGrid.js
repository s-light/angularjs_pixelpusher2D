/******************************************************************************

    SVG-Grid directive

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

var slSvgGrid = angular.module('slSvgGrid', [
    // 'myDirectivesArrays',
]);

// get current script path
// http://stackoverflow.com/a/21103831/574981
// var scripts = document.getElementsByTagName("script");
// var slSvgGrid_scriptPath = scripts[scripts.length-1].src;
var slSvgGrid_scriptElement = document.querySelector(
    "[src*=slSvgGrid]"
);
var slSvgGrid_scriptPath = slSvgGrid_scriptElement.getAttribute('src');
var slSvgGrid_templateURL = slSvgGrid_scriptPath.replace('.js', '.html');
// var slSvgGrid_templateURL_svggrid = slSvgGrid_templateURL.replace('.html', '_svggrid.html');


slSvgGrid.directive('slSvgGrid', [
    '$filter',
function(
    $filter
) { return {
    restrict: 'A',
    scope: {
        width: '=',
        height: '=',
        stepSize: '=',
        showGrid: '=',
        showNumbers: '=',
    },
    // templateUrl: slSvgGrid_templateURL,
    templateUrl: function() {
        // only for development!!!!!
        // this disables the caching of the template file..
        return slSvgGrid_templateURL + '?' + new Date();
    },
    link: function(scope, element, attr, ctrl) {
        // console.log("slSvgGrid:");
        // console.log("scope", scope);
        // console.log("element", element);
        // console.log("attrs", attrs);
        // console.log("ctrl", ctrl);

        // console.log("scope.height", scope.height);
        // console.log("scope.width", scope.width);
        // console.log("scope.stepSize", scope.stepSize);
        // console.log("scope.showGrid", scope.showGrid);
        // console.log("scope.showNumbers", scope.showNumbers);

        // default settings

        if (typeof scope.height !== "number") {
            console.log(" using default height");
            scope.width = 5000;
        }
        if (typeof scope.width !== "number") {
            console.log(" using default width");
            scope.width = 5000;
        }
        if (typeof scope.stepSize !== "number") {
            console.log(" using default stepSize");
            scope.stepSize = 1000;
        }
        if (typeof Boolean(scope.showGrid) !== "boolean") {
            console.log(" using default showGrid");
            scope.showGrid = true;
        }
        if (typeof Boolean(scope.showNumbers) !== "boolean") {
            console.log(" using default showNumbers");
            scope.showNumbers = true;
        }


        /******************************************/
        /** handle grid **/

        // range function by Mathieu Rodic
        // http://stackoverflow.com/questions/11873570/angularjs-for-loop-with-numbers-ranges
        function range(min, max, step) {
            // parameters validation for method overloading
            if (max === undefined) {
                max = min;
                min = 0;
            }
            step = Math.abs(step) || 1;
            if (min > max) {
                step = -step;
            }
            // building the array
            var output = [];
            for (var value=min; value<max; value+=step) {
                output.push(value);
            }
            // returning the generated array
            return output;
        }

        function numberToMultipleOf(value, base){
            var result = 0;
            var times = Math.floor(value/base);
            result = times * base;
            // while (result < value) {
                // result = result + base;
            // }
            return result;
        }

        function fit_to_limits(value, min, max) {
            // check for min
            if (value <= min) {
                value = min;
            }
            // check for max
            if (value >= max) {
                value = max;
            }
            return value;
        }

        // update grid
        // function updateRange(range_array, newLength, stepSize) {
        //     newLength = numberToMultipleOf(newLength, stepSize);
        //     var newCount = (newLength / stepSize)-1;
        //     if (!range_array){
        //         range_array = [0];
        //     }
        //     // update array
        //     if (range_array.length > newCount) {
        //         // pop elements from end.
        //         while (range_array.length > newCount) {
        //             range_array.pop();
        //         }
        //     } else {
        //         // push elements to end.
        //         while (range_array.length <= newCount) {
        //             var indexNew = range_array[range_array.length-1]+1;
        //             range_array.push(indexNew);
        //         }
        //     }
        //     // console.log("range_array", range_array);
        //     return range_array;
        // }

        function checkStepSize() {
            // check if StepSize is a valid value.
            if (typeof scope.stepSize !== "number") {
                scope.stepSize = scope.width/10;
            }
            // round to full integer
            scope.stepSize = Math.round( scope.stepSize * 10 * 10) / 100;
            // check min and max bounds
            scope.stepSize = fit_to_limits(
                scope.stepSize,
                1,
                scope.width
            );
        }

        function updateGridXArray() {
            checkStepSize();
            // scope.xArray = updateRange(
            //     scope.xArray,
            //     scope.width,
            //     scope.stepSize
            // );
            scope.xArray = range(
                0,
                scope.width,
                scope.stepSize
            );
            // console.log("scope.xArray", scope.xArray);
        }

        function updateGridYArray() {
            checkStepSize();
            // scope.yArray = updateRange(
            //     scope.yArray,
            //     scope.height,
            //     scope.stepSize
            // );
            scope.yArray = range(
                0,
                scope.height,
                scope.stepSize
            );
        }

        // width (x axis)
        scope.$watch(
            function() {
                return scope.width;
            },
            updateGridXArray
        );
        // height (y axis)
        scope.$watch(
            function(){
                return scope.height;
            },
            updateGridYArray
        );
        // watch stepSize
        scope.$watch(
            function() {
                return scope.stepSize;
            },
            function() {
                updateGridXArray();
                updateGridYArray();
            }
        );

    }
};}
]);
