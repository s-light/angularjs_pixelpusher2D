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
    '$document',
function($parse, $timeout, $filter, $document) { return {
    restrict: 'A',
    // require: 'ngModel',
    // transclude: true,
    scope: {
        data: '=',
        itemActive: '=',
        selected: '=',
        itemSize: '=',
        settings: '=',
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

        // default settings
        if (!scope.settings) {
            scope.settings = {
                select: {
                    forceItemEnclosure: false,
                }
            };
        }

        function itemDeselect(item) {
            if (item.selected != 0) {
                item.selected = 0;
                // item.selected = false;
                if (scope.itemActive == item) {
                    // remove active
                    scope.itemActive = null;
                }
            }
        }

        function itemSelect(item) {
            if (item.selected != 1) {
                item.selected = 1;
                // item.selected = true;
                scope.itemActive = item;
            }
        }

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
                    itemDeselect(item);
                }
            } else {
                // currently unselected
                itemSelect(item);
            }
            // console.log("item", item);
            // console.log("scope.itemActive", scope.itemActive);
            // console.groupEnd();
        };


        /** box select **/

        // var svg_base = document.getElementsByTagName("svg")[0];
        // var box_select = document.getElementsByTagName("svg")[0].getElementById("box_select");box_select.classList.add('active');

        // var svg_base = element[0].querySelector("svg");
        var svg_base_jql = element.find("svg");
        var svg_base = svg_base_jql[0];
        // console.log("svg_base", svg_base);
        var box_select = svg_base.getElementById("box_select");
        // console.log("box_select", box_select);

        var box_select_data = {
            active: false,
            start: {
                p1: svg_base.createSVGPoint(),
                p2: svg_base.createSVGPoint(),
            },
            current: {
                p1: svg_base.createSVGPoint(),
                p2: svg_base.createSVGPoint(),
            },
        };

        // getIntersectionList
        // getEnclosureList(in SVGRect rect, in SVGElement referenceElement)
        // this functions are not implemented in firefox :-(

        function itemGetPoints(item) {
            var result_points = {
                p1: svg_base.createSVGPoint(),
                p2: svg_base.createSVGPoint(),
            };
            // var el = svg_base.getElementById("a1");
            var element = svg_base.getElementById(item.id);
            result_points.p1.x = element.x.baseVal.value;
            result_points.p1.y = element.y.baseVal.value;
            result_points.p2.x =
                result_points.p1.x + element.width.baseVal.value;
            result_points.p2.y =
                result_points.p1.y + element.height.baseVal.value;
            return result_points;
        }

        function checkForIntersection(itemPs, rectPs) {
            var result = false;
            // check if item area is in points area
            // see helper_intersection.svg
            // x-axis
            var x_axis = false;
            // rect is bigger as item
            if (
                (rectPs.p1.x <= itemPs.p1.x) &&
                (rectPs.p2.x >= itemPs.p1.x)
            ) {
                x_axis = true;
            }
            if (
                (rectPs.p1.x <= itemPs.p2.x) &&
                (rectPs.p2.x >= itemPs.p2.x)
            ) {
                x_axis = true;
            }
            // rect is smaller as item
            if (
                (itemPs.p1.x <= rectPs.p1.x) &&
                (itemPs.p2.x >= rectPs.p1.x)
            ) {
                x_axis = true;
            }
            if (
                (itemPs.p1.x <= rectPs.p2.x) &&
                (itemPs.p2.x >= rectPs.p2.x)
            ) {
                x_axis = true;
            }
            // y-axis
            var y_axis = false;
            // rect is bigger as item
            if (
                (rectPs.p1.y <= itemPs.p1.y) &&
                (rectPs.p2.y >= itemPs.p1.y)
            ) {
                y_axis = true;
            }
            if (
                (rectPs.p1.y <= itemPs.p2.y) &&
                (rectPs.p2.y >= itemPs.p2.y)
            ) {
                y_axis = true;
            }
            // rect is smaller as item
            if (
                (itemPs.p1.y <= rectPs.p1.y) &&
                (itemPs.p2.y >= rectPs.p1.y)
            ) {
                y_axis = true;
            }
            if (
                (itemPs.p1.y <= rectPs.p2.y) &&
                (itemPs.p2.y >= rectPs.p2.y)
            ) {
                y_axis = true;
            }
            // combine x+y
            if (x_axis && y_axis) {
                result = true;
            }
            return result;
        }

        function checkForEnclosure(itemPs, rectPs) {
            var result = false;
            // check if item area is in points area
            // see helper_intersection.svg
            // x-axis
            var x_axis = false;
            if (
                (
                    (rectPs.p1.x <= itemPs.p1.x) &&
                    (rectPs.p2.x >= itemPs.p1.x)
                ) && (
                    (rectPs.p1.x <= itemPs.p2.x) &&
                    (rectPs.p2.x >= itemPs.p2.x)
                )
            ) {
                x_axis = true;
            }
            // y-axis
            var y_axis = false;
            if (
                (
                    (rectPs.p1.y <= itemPs.p1.y) &&
                    (rectPs.p2.y >= itemPs.p1.y)
                ) && (
                    (rectPs.p1.y <= itemPs.p2.y) &&
                    (rectPs.p2.y >= itemPs.p2.y)
                )
            ) {
                y_axis = true;
            }
            // combine x+y
            if (x_axis && y_axis) {
                result = true;
            }
            return result;
        }

        function selectCoverdItem(item, rectPs) {
            // get coverd area of item
            var itemPs = itemGetPoints(item);
            // check
            var itemInArea = false;
            if(scope.settings.select.forceItemEnclosure){
                itemInArea = checkForEnclosure(itemPs, rectPs);
            } else {
                itemInArea = checkForIntersection(itemPs, rectPs);
            }
            if (itemInArea) {
                // select
                itemSelect(item);
            } else {
                // deselect
                itemDeselect(item);
            }
            scope.$apply();
        }

        function selectCoverdItems(rectPs) {
            scope.data.items.forEach(function(item, index, items){
                selectCoverdItem(item, rectPs);
            });
        }

        function remap_pointsObj(points) {
            return remap_points(points.p1, points.p2);
        }

        function remap_points(p1, p2) {
            // switch between positiv and negative orientations..
            var result = {
                p1: svg_base.createSVGPoint(),
                p2: svg_base.createSVGPoint(),
            };
            if (p1.x < p2.x) {
                result.p1.x = p1.x;
                result.p2.x = p2.x;
            } else {
                result.p1.x = p2.x;
                result.p2.x = p1.x;
            }
            if (p1.y < p2.y) {
                result.p1.y = p1.y;
                result.p2.y = p2.y;
            } else {
                result.p1.y = p2.y;
                result.p2.y = p1.y;
            }
            return result;
        }

        function box_select_set_position_size(points) {
            box_select.x.baseVal.value = points.p1.x;
            box_select.width.baseVal.value =
                points.p2.x - points.p1.x;
            box_select.y.baseVal.value = points.p1.y;
            box_select.height.baseVal.value =
                points.p2.y - points.p1.y;
        }

        // based on
        //
        svg_base_jql.on('mousedown', function(event) {
            // Prevent default dragging of selected content
            event.preventDefault();

            // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
            // console.log("event", event);
            // console.log("event.pageX", event.pageX);
            // console.log("event.screenX", event.screenX);
            // console.log("event.clientX", event.clientX);
            // console.log("event.offsetX", event.offsetX);

            // console.log("event.movementX", event.movementX);
            // console.log("scope", scope);

            // create svg point with screen coordinates
            // tipp with getScreenCTM found at
            // http://stackoverflow.com/a/22185664/574981
            var point_raw = svg_base.createSVGPoint();
            point_raw.x = event.clientX;
            point_raw.y = event.clientY;

            // get transform matrix
            var screen2SVG = svg_base.getScreenCTM().inverse();

            // transform
            box_select_data.start.p1 = point_raw.matrixTransform(screen2SVG);
            // for init set p2 to same values
            box_select_data.start.p2 = box_select_data.start.p1;
            // console.log("box_select_data", box_select_data);

            // set position
            box_select_set_position_size(box_select_data.start);

            // set box_select active
            box_select_data.active = true;
            // box_select.addClass('active');
            box_select.classList.add('active');

            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
        });

        function mousemove(event) {
            // create svg point with screen coordinates
            var point_current_raw = svg_base.createSVGPoint();
            point_current_raw.x = event.clientX;
            point_current_raw.y = event.clientY;
            // get transform matrix
            var screen2SVG = svg_base.getScreenCTM().inverse();
            // transform
            var point_current = point_current_raw.matrixTransform(screen2SVG);
            box_select_data.current = remap_points(
                box_select_data.start.p1,
                point_current
            );
            // set size
            box_select_set_position_size(box_select_data.current);
            // update selection
            selectCoverdItems(box_select_data.current)
        }

        function mouseup() {
            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
            box_select_data.active = false;
            box_select.classList.remove('active')
        }



        /** handle zoom / pan **/

        // currentTranslate
        // var el = document.getElementsByTagName("svg")[0];




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
        };

        function numberToMultipleOf(value, base){
            var result = 0;
            var times = Math.floor(value/base);
            result = times * base;
            // while (result < value) {
                // result = result + base;
            // }
            return result;
        }

        // update grid
        function updateRange(range_array, newLength, stepSize) {
            newLength = numberToMultipleOf(newLength, stepSize)
            var newCount = (newLength / stepSize)-1;
            if (!range_array){
                range_array = [0];
            }
            // update array
            if (range_array.length > newCount) {
                // pop elements from end.
                while (range_array.length > newCount) {
                    range_array.pop();
                }
            } else {
                // push elements to end.
                while (range_array.length <= newCount) {
                    var indexNew = range_array[range_array.length-1]+1;
                    range_array.push(indexNew);
                }
            }
            // console.log("range_array", range_array);
            return range_array;
        }

        function updateGridXArray() {
            // scope.data.world.grid.xArray = updateRange(
            //     scope.data.world.grid.xArray,
            //     scope.data.world.width,
            //     scope.data.world.grid.stepSize
            // );
            scope.data.world.grid.xArray = range(
                0,
                scope.data.world.width,
                scope.data.world.grid.stepSize
            );
            // console.log("scope.data.world.grid.xArray", scope.data.world.grid.xArray);
        }

        function updateGridYArray() {
            // scope.data.world.grid.yArray = updateRange(
            //     scope.data.world.grid.yArray,
            //     scope.data.world.height,
            //     scope.data.world.grid.stepSize
            // );
            scope.data.world.grid.yArray = range(
                0,
                scope.data.world.height,
                scope.data.world.grid.stepSize
            );
        }

        // x axis
        scope.$watch(
            function() {
                return scope.data.world.width;
            },
            updateGridXArray
        );
        // y axis
        scope.$watch(
            function(){
                return scope.data.world.height;
            },
            updateGridYArray
        );
        scope.$watch(
            function() {
                return scope.data.world.grid.stepSize;
            },
            function() {
                updateGridXArray();
                updateGridYArray();
            }
        );

        /** update selected list **/

        // watch example/info http://stackoverflow.com/a/15113029/574981
        // watch deep
        scope.$watch(
            function(){
                return scope.data.items;
            },
            function() {
                // console.log("Taglist watch fired.");
                // scope.selected = $filter('filter')(scope.data.items, {selected:'true'});
                scope.selected = $filter('filter')(scope.data.items, {selected:'1'});
            },
            true
        );

    }
};}]);
