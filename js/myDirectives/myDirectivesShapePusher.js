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
var myDiSP_scriptElement = document.querySelector(
    "[src*=myDirectivesShapePusher]"
);
var myDiSP_scriptPath = myDiSP_scriptElement.getAttribute('src');
var myDiSP_templateURL = myDiSP_scriptPath.replace('.js', '.html');
// var myDiSP_templateURL_svggrid = myDiSP_templateURL.replace('.html', '_svggrid.html');


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
        items: '=',
        settings: '=',
        itemActive: '=',
        selected: '=',
    },
    // template: '<ul class="tagslist"></ul>',
    // templateUrl: 'js/myDirectivesShapePusher.html',
    // templateUrl: myDiSP_templateURL,
    templateUrl: function() {
        // only for development!!!!!
        // this disables the caching of the template file..
        // console.log("shapepusher");
        // console.log("myDTl_scriptPath:", myDTl_scriptPath);
        return myDiSP_templateURL + '?' + new Date();
    },
    link: function(scope, element, attr, ctrl) {
        // console.log("directive date");
        // console.log("scope", scope);
        // console.log("element", element);
        // console.log("attrs", attrs);
        // console.log("ctrl", ctrl);

        // console.log("items", scope.items);
        // console.log("settings", scope.settings);


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

        var items_default = [
            {
                id: 'a1',
                position: {
                    x: 1000,
                    y: 1000,
                },
                // size: {
                //     width: 1000,
                //     height: 1000,
                // },
            },
        ];

        var settings_default = {
            world: {
                // in mm
                width: 10000,
                height: 5000,
            },
            item: {
                width: 500,
                height: 500,
            },
            grid: {
                visible: true,
                numbers: true,
                stepSize: 1000,
            },
            gridSnap: {
                visible: true,
                stepSize: 250,
            },
            select: {
                forceItemEnclosure: false,
            },
            move: {
                snap: false,
            },
        };

        function handle_defaults() {
            var messages = [];

            if (!scope.items) {
                scope.items = items_default;
                messages.push("no items found");
            }

            if (!scope.settings) {
                scope.settings = settings_default;
                messages.push("no settings found");
            } else {
                angular.merge(scope.settings, settings_default);

                // // check for every possible setting:
                // angular.forEach(settings_default, function(value, key) {
                //     console.log("key", key);
                //     console.log("value", value);
                //     if (!scope.settings.hasOwnProperty(key)) {
                //     // if (!scope.settings[key])
                //         scope.settings[key] = value;
                //         this.push(key);
                //     } else {
                //         // key is there so check subparts
                //         angular.forEach(scope.settings[key], function(value2, key2) {
                //             if (!scope.settings[key].hasOwnProperty(key2)) {
                //             // if (!scope.settings[key][key2])
                //                 scope.settings[key][key2] = value2;
                //                 this.push(key2);
                //             } else {
                //                 // key is there
                //                 // so nothing to do.
                //             }
                //         }, this);
                //     }
                // }, messages);
            }
            if (messages.length > 0) {
                console.group("shapepusher  handle_defaults:");
                console.log("fall back to default values for:");
                messages.forEach(function(element, index, array){
                    console.log("    " + element);
                });
                console.groupEnd();
            }
        }
        // setup default values if they are not user specified:
        handle_defaults();





        /** special elements **/

        // var svg_base = document.getElementsByTagName("svg")[0];
        // var box_select = document.getElementsByTagName("svg")[0].getElementById("box_select");box_select.classList.add('active');

        // var svg_base = element[0].querySelector("svg");
        var svg_base_jql = element.find("svg");
        var svg_base = svg_base_jql[0];
        // console.log("svg_base", svg_base);


        /** helper **/

        function convert_point_2_SVG_coordinate_point(point) {
            // tipp with getScreenCTM found at
            // http://stackoverflow.com/a/22185664/574981
            // get transform matrix
            var screen2SVG = svg_base.getScreenCTM().inverse();
            // transform to svg coordinates
            var point_out = point.matrixTransform(screen2SVG);
            return point_out;
        }

        function convert_xy_2_SVG_coordinate_point(x, y) {
            // create svg point
            var point_in = svg_base.createSVGPoint();
            point_in.x = x;
            point_in.y = y;
            var point_out = convert_point_2_SVG_coordinate_point(point_in);
            return point_out;
        }

        function points_add(p1, p2) {
            var result_p = svg_base.createSVGPoint();
            result_p.x = p1.x + p2.x;
            result_p.y = p1.y + p2.y;
            return result_p;
        }

        function point_round2multiple(p1, stepSize) {
            var result_p = svg_base.createSVGPoint();
            // divide by stepSize
            var x1 = p1.x / stepSize;
            var y1 = p1.y / stepSize;
            // round
            var x2 = Math.round(x1);
            var y2 = Math.round(y1);
            // multiply by stepSize
            result_p.x = x2 * stepSize;
            result_p.y = y2 * stepSize;
            return result_p;
        }

        function point_find_nearest_snap(p1) {
            var stepSize = scope.settings.gridSnap.stepSize;
            return point_round2multiple(p1, stepSize);
        }

        function point_round2integer(point) {
            var result_p = svg_base.createSVGPoint();
            result_p.x = parseInt(point.x, 10);
            result_p.y = parseInt(point.y, 10);
            return result_p;
        }

        function itemById(id) {
            var item = scope.items.find(function(element, index, array){
                if (element.id == id) {
                    return true;
                } else {
                    return false;
                }
            });
            return item;
        }


        /** item mousedown handling **/

        function item_mousedown(event, item) {
            // console.log("item_mousedown");
            // Prevent default dragging of selected content
            event.preventDefault();
            item_selection_toggle(item);
            item_moving_mousedown(event, item);
        }
        scope.item_mousedown = item_mousedown;

        /** item select **/

        function item_deselect(item) {
            if (item.selected !== 0) {
                item.selected = 0;
                // item.selected = false;
                if (scope.itemActive == item) {
                    // remove active
                    scope.itemActive = null;
                }
            }
        }

        function item_select(item) {
            if (item.selected != 1) {
                item.selected = 1;
                // item.selected = true;
                scope.itemActive = item;
            }
        }

        function item_selection_toggle(item) {
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
                    item_deselect(item);
                }
            } else {
                // currently unselected
                item_select(item);
            }
            // console.log("item", item);
            // console.log("scope.itemActive", scope.itemActive);
            // console.groupEnd();
        }

        /** item moving **/

        var item_moving_click_offset = {
            x: 0,
            y: 0,
        };

        function itemSVGelement_by_event(event){
            // get target element
            var element_raw = event.target;
            // console.log("element_raw", element_raw);
            // get svg element
            var itemSVG = element_raw.parentElement;
            // only works in some browsers:
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
            // var itemSVG = element_raw.closest("svg.item");

            return itemSVG;
        }

        function item_moving_mousedown(event, item) {
            // console.log("item_moving_mousedown", event.target);
            // Prevent default dragging of selected content
            event.preventDefault();
            // prevent box selection to trigger
            event.stopPropagation();

            // get element
            var element = itemSVGelement_by_event(event);
            // console.log("element", element);

            // get item
            // var item = itemById(element.id);
            // we already have the reference from the calling.

            // get current point
            var point_current = convert_xy_2_SVG_coordinate_point(
                event.pageX,
                event.pageY
            );

            // calculate item click offset
            item_moving_click_offset.x = item.position.x - point_current.x;
            item_moving_click_offset.y = item.position.y - point_current.y;

            // setup events
            // wrapp with jQlight
            element_jql = angular.element(element);
            // eventData not supported by jQlight
            // element_jql.on('mousemove', {item:item}, item_moving_mousemove);
            element_jql.on('mousemove', item_moving_mousemove);
            element_jql.on('mouseup', item_moving_end);
            element_jql.on('mouseleave', item_moving_end);
            // element_jql.on('mouseout', item_moving_end);
        }

        function item_moving_mousemove(event) {
            // console.log("item_moving_mousemove", event.target);
            // get current point
            var point_current = convert_xy_2_SVG_coordinate_point(
                event.pageX,
                event.pageY
            );

            // eventData not supported by jQlight
            // var item = event.data.item;

            // var element = itemSVGelement_by_event(event);
            var element = event.currentTarget;
            // get item
            var item = itemById(element.id);

            // console.log("item", item);

            // calculate new position
            var p_raw = points_add(item_moving_click_offset, point_current);

            // convert to integer (strip all fractions)
            var p_clean = point_round2integer(p_raw);

            // check if snapping is enabled
            if (scope.settings.move.snap) {
                // snap
                p_clean = point_find_nearest_snap(p_clean);
            }

            // set item position
            item.position.x = p_clean.x;
            item.position.y = p_clean.y;
            // scope.$apply();
            element.x.baseVal.value = p_clean.x;
            element.y.baseVal.value = p_clean.y;
        }

        function item_moving_end(event, item) {
            // console.log("item_moving_end", event.target);
            item_moving_click_offset.x = 0;
            item_moving_click_offset.y = 0;
            // get element
            // var element = itemSVGelement_by_event(event);
            var element = event.currentTarget;
            // wrapp with jQlight
            element_jql = angular.element(element);
            // shut off events
            element_jql.off('mousemove', item_moving_mousemove);
            element_jql.off('mouseup', item_moving_end);
            element_jql.on('mouseleave', item_moving_end);
            // element_jql.off('mouseout', item_moving_end);
        }


        // function item_moving_init() {
        //     scope.items.forEach(function(item, index, items){
        //         var element = svg_base.getElementById(item.id);
        //         angular.element(element).on('mousedown', item_moving_mousedown);
        //     });
        // }
        //
        // item_moving_init();

        /** box select **/

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
                item_select(item);
            } else {
                // deselect
                item_deselect(item);
            }
            scope.$apply();
        }

        function selectCoverdItems(rectPs) {
            scope.items.forEach(function(item, index, items){
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
            var point_current = convert_xy_2_SVG_coordinate_point(
                event.pageX,
                event.pageY
            );

            // get transform matrix
            var screen2SVG = svg_base.getScreenCTM().inverse();

            // transform
            box_select_data.start.p1 = point_current;
            // for init set p2 to same values
            box_select_data.start.p2 = point_current;
            // console.log("box_select_data", box_select_data);

            // set position
            box_select_set_position_size(box_select_data.start);

            // set box_select active
            box_select_data.active = true;
            // box_select.addClass('active');
            box_select.classList.add('active');

            $document.on('mousemove', box_select_mousemove);
            $document.on('mouseup', box_select_mouseup);
        });

        function box_select_mousemove(event) {
            // api correct:
            // event.clientX,
            // event.clientY
            // pageX -> normalized by jQlight
            var point_current = convert_xy_2_SVG_coordinate_point(
                event.pageX,
                event.pageY
            );
            box_select_data.current = remap_points(
                box_select_data.start.p1,
                point_current
            );
            // set size
            box_select_set_position_size(box_select_data.current);
            // update selection
            selectCoverdItems(box_select_data.current);
        }

        function box_select_mouseup() {
            $document.off('mousemove', box_select_mousemove);
            $document.off('mouseup', box_select_mouseup);
            box_select_data.active = false;
            box_select.classList.remove('active');
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

        // update grid
        function updateRange(range_array, newLength, stepSize) {
            newLength = numberToMultipleOf(newLength, stepSize);
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
            // scope.settings.grid.xArray = updateRange(
            //     scope.settings.grid.xArray,
            //     scope.settings.world.width,
            //     scope.settings.grid.stepSize
            // );
            scope.settings.grid.xArray = range(
                0,
                scope.settings.world.width,
                scope.settings.grid.stepSize
            );

            scope.settings.gridSnap.xArray = range(
                0,
                scope.settings.world.width,
                scope.settings.gridSnap.stepSize
            );
            // console.log("scope.settings.grid.xArray", scope.settings.grid.xArray);
        }

        function updateGridYArray() {
            // scope.settings.grid.yArray = updateRange(
            //     scope.settings.grid.yArray,
            //     scope.settings.world.height,
            //     scope.settings.grid.stepSize
            // );
            scope.settings.grid.yArray = range(
                0,
                scope.settings.world.height,
                scope.settings.grid.stepSize
            );

            scope.settings.gridSnap.yArray = range(
                0,
                scope.settings.world.height,
                scope.settings.gridSnap.stepSize
            );
        }

        // x axis
        scope.$watch(
            function() {
                return scope.settings.world.width;
            },
            updateGridXArray
        );
        // y axis
        scope.$watch(
            function(){
                return scope.settings.world.height;
            },
            updateGridYArray
        );
        scope.$watch(
            function() {
                return scope.settings.grid.stepSize;
            },
            function() {
                updateGridXArray();
                updateGridYArray();
            }
        );
        scope.$watch(
            function() {
                return scope.settings.gridSnap.stepSize;
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
                return scope.items;
            },
            function() {
                // console.log("Taglist watch fired.");
                // scope.selected = $filter('filter')(scope.settings.items, {selected:'true'});
                scope.selected = $filter('filter')(scope.items, {selected:'1'});
            },
            true
        );

    }
};}]);
