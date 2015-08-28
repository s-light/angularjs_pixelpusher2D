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
                selected: false,
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




        /******************************************/
        /** special elements **/

        // var svg_base = document.getElementsByTagName("svg")[0];
        // var box_select = document.getElementsByTagName("svg")[0].getElementById("box_select");box_select.classList.add('active');

        // var svg_base = element[0].querySelector("svg");
        var svg_base_jql = element.find("svg");
        var svg_base = svg_base_jql[0];
        // console.log("svg_base", svg_base);

        /******************************************/
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

        function points_subtract(p1, p2) {
            var result_p = svg_base.createSVGPoint();
            result_p.x = p1.x - p2.x;
            result_p.y = p1.y - p2.y;
            return result_p;
        }

        function points_distances(p1, p2) {
            var result = {
                width: 0,
                height: 0,
            };
            var distances = points_subtract(p1, p2);
            result.width = Math.abs(distances.x);
            result.height = Math.abs(distances.y);
            return result;
        }

        function points_get_distance(p1, p2) {
            var distances = points_distances(p1, p2);
            // get distance with trigonometry
            // a²+b² = c²
            var distance = Math.sqrt(
                (distances.width * distances.width) +
                (distances.height * distances.height)
            );
            return distance;
        }

        function points_check_xy_higher_then(p1, p2, width, height) {
            var result = false;
            var distance = points_distances(p1, p2);
            if (
                (distance.width > width) &&
                (distance.height > height)
            ) {
                result = true;
            }
            return result;
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
            // now handled in mouseup
            // item_selection_toggle(item);
            item_moving_mousedown(event, item);
        }
        scope.item_mousedown = item_mousedown;

        /******************************************/
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

        /******************************************/
        /** item moving **/

        var item_moving = {
            p_start : {},
            moved: false,
            item: {},
            offset: {
                x: 0,
                y: 0,
            },
            selected: [
                {
                    item:{}, // reference to item
                    offset:{
                        x: 0,
                        y: 0,
                    }
                }
            ],
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

        function item_moving_selected_prepare(p_start) {
            // clean list:
            item_moving.selected.length = 0;
            // fill list:
            angular.forEach(scope.selected, function(s_item, key) {
                // check so we don't add the draged item again.
                if (s_item !== item_moving.item) {
                    var si_new = {
                        item: {}, // reference to item
                        element: {},
                        offset: {
                            x: 0,
                            y: 0,
                        }
                    };
                    // set reference
                    si_new.item = s_item;
                    si_new.element = svg_base.getElementById(si_new.item.id);
                    // calculate & set offset
                    si_new.offset = points_subtract(
                        s_item.position,
                        p_start
                    );
                    // add to list
                    item_moving.selected.push(si_new);
                }
            });
        }

        function item_moving_selected_update(p_current) {
            angular.forEach(item_moving.selected, function(si_data, key) {
                    // calculate new position
                    var p_new = points_add(si_data.offset, p_current);

                    // convert to integer (strip all fractions)
                    var p_clean = point_round2integer(p_new);

                    // check if snapping is enabled
                    // if (scope.settings.move.snap) {
                    //     // snap
                    //     p_clean = point_find_nearest_snap(p_clean);
                    // }

                    // set item position
                    si_data.item.position.x = p_clean.x;
                    si_data.item.position.y = p_clean.y;
                    // scope.$apply();
                    si_data.element.x.baseVal.value = p_clean.x;
                    si_data.element.y.baseVal.value = p_clean.y;
            });
        }

        function item_moving_mousedown(event, item) {
            // console.log("item_moving_mousedown", event.target);
            // Prevent default dragging of selected content
            event.preventDefault();
            // prevent box selection to trigger
            event.stopPropagation();

            // get element
            // var element = itemSVGelement_by_event(event);
            // console.log("element", element);

            // get current point
            var p_current = convert_xy_2_SVG_coordinate_point(
                event.pageX,
                event.pageY
            );


            // get item
            // var item = itemById(element.id);
            // we already have the reference from the calling.
            item_moving.item = item;
            item_moving.element = svg_base.getElementById(item_moving.item.id);
            item_moving.moved = false;
            // store start point (for later use)
            item_moving.p_start = p_current;

            // calculate item click offset
            item_moving.offset = points_subtract(item.position, p_current);
            // item_moving.offset.x = item.position.x - p_current.x;
            // item_moving.offset.y = item.position.y - p_current.y;

            if (scope.settings.move.selected) {
                // do all the above for every selected item
                item_moving_selected_prepare(p_current);
            }

            // setup events
            // wrapp with jQlight
            // element_jql = angular.element(element);
            element_jql = angular.element(svg_base);
            // eventData not supported by jQlight
            // element_jql.on('mousemove', {item:item}, item_moving_mousemove);
            element_jql.on('mousemove', item_moving_mousemove);
            element_jql.on('mouseup', item_mouseup);
            element_jql.on('mouseleave', item_moving_end);
            // element_jql.on('mouseout', item_moving_end);
        }

        function item_moving_mousemove(event) {
            // console.log("item_moving_mousemove", event.target);
            // get current point
            var p_current = convert_xy_2_SVG_coordinate_point(
                event.pageX,
                event.pageY
            );

            // check if mouse moved
            if (!item_moving.moved) {
                var dist = points_get_distance(p_current, item_moving.p_start);
                if (dist > 10) {
                    item_moving.moved = true;
                    // console.log("mouse moved..");
                }
            }

            // eventData not supported by jQlight
            // var item = event.data.item;

            // now the currentTarget is the main SVG
            // var element = event.currentTarget;
            // var element = itemSVGelement_by_event(event);
            // var element = svg_base.getElementById(item_moving.item.id);

            // get item
            // var item = itemById(element.id);
            // var item = item_moving.item;

            // console.log("item", item);


            // calculate new position
            var p_new = points_add(item_moving.offset, p_current);

            // convert to integer (strip all fractions)
            var p_clean = point_round2integer(p_new);

            // check if snapping is enabled
            if (scope.settings.move.snap) {
                // snap
                p_clean = point_find_nearest_snap(p_clean);
            }

            // set item position
            item_moving.item.position.x = p_clean.x;
            item_moving.item.position.y = p_clean.y;
            // scope.$apply();
            item_moving.element.x.baseVal.value = p_clean.x;
            item_moving.element.y.baseVal.value = p_clean.y;

            if (scope.settings.move.selected) {
                // check if snapping is enabled
                if (scope.settings.move.snap) {
                    // remove offset for snapping
                    // so that all selected are moved relative with snapping
                    p_current = points_subtract(p_clean, item_moving.offset);
                }
                // do all the above for every selected item
                item_moving_selected_update(p_current);
            }
        }

        function item_mouseup(event) {
            // console.log("item_mouseup");
            // check if mousemoved
            if (!item_moving.moved) {
                // console.log("!item_moving.moved");
                // console.log("item_moving.item", item_moving.item);
                item_selection_toggle(item_moving.item);
            }
            item_moving_end(event);
            scope.$apply();
        }

        function item_moving_end(event) {
            // console.log("item_moving_end", event.target);
            item_moving.p_start = {};
            item_moving.offset.x = 0;
            item_moving.offset.y = 0;
            item_moving.item = {};
            // get element
            // var element = itemSVGelement_by_event(event);
            var element = event.currentTarget;
            // wrapp with jQlight
            element_jql = angular.element(element);
            // shut off events
            element_jql.off('mousemove', item_moving_mousemove);
            element_jql.off('mouseup', item_mouseup);
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


        /******************************************/
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

        // inspired by
        // https://docs.angularjs.org/guide/directive#creating-a-directive-that-adds-event-listeners
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
            var p_current = convert_xy_2_SVG_coordinate_point(
                event.pageX,
                event.pageY
            );

            // get transform matrix
            var screen2SVG = svg_base.getScreenCTM().inverse();

            // transform
            box_select_data.start.p1 = p_current;
            // for init set p2 to same values
            box_select_data.start.p2 = p_current;
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
            var p_current = convert_xy_2_SVG_coordinate_point(
                event.pageX,
                event.pageY
            );
            box_select_data.current = remap_points(
                box_select_data.start.p1,
                p_current
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


        /******************************************/
        /** handle zoom / pan **/

        // currentTranslate
        // var el = document.getElementsByTagName("svg")[0];



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

        // world.width (x axis)
        scope.$watch(
            function() {
                return scope.settings.world.width;
            },
            updateGridXArray
        );
        // world.height (y axis)
        scope.$watch(
            function(){
                return scope.settings.world.height;
            },
            updateGridYArray
        );
        // watch grid.stepSize
        scope.$watch(
            function() {
                return scope.settings.grid.stepSize;
            },
            function() {
                updateGridXArray();
                updateGridYArray();
            }
        );
        // watch gridSnap.stepSize
        scope.$watch(
            function() {
                return scope.settings.gridSnap.stepSize;
            },
            function() {
                updateGridXArray();
                updateGridYArray();
            }
        );


        /******************************************/
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
