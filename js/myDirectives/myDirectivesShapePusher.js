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
    'myDirectives_ngTouch',
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
    // '$parse',
    '$timeout',
    '$filter',
    '$document',
function(
    // $parse,
    $timeout,
    $filter,
    $document
) { return {
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
                pan: {
                    enabled: false,
                    x: 0,
                    y: 0,
                },
                zoom: {
                    enabled: false,
                    factor: 1,
                },
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
                enabled: true,
            },
            box_select: {
                enabled: true,
                forceItemEnclosure: false,
            },
            move: {
                enabled: true,
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
                scope.settings = angular.merge({}, settings_default, scope.settings);

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
        // var box_select = document.getElementsByTagName("svg")[0].getElementById("box_select");box_select.classList.add('enabled');

        // var svg_base = element[0].querySelector("svg");
        var svg_base_jql = element.find("svg");
        var svg_base = svg_base_jql[0];
        // console.log("svg_base", svg_base);


        /******************************************/
        /** helper **/

        function point_convert_2_SVG_coordinate_point(point) {
            // tipp with getScreenCTM found at
            // http://stackoverflow.com/a/22185664/574981
            // make sure point is SVGPoint
            if ( ! (point instanceof SVGPoint) ) {
                var pSVG = svg_base.createSVGPoint();
                pSVG.x = point.x;
                pSVG.y = point.y;
                point = pSVG;
            }
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
            var point_out = point_convert_2_SVG_coordinate_point(point_in);
            return point_out;
        }

        function points_add(p1, p2) {
            var p_result = {
                x: 0,
                y: 0,
            };
            p_result.x = p1.x + p2.x;
            p_result.y = p1.y + p2.y;
            return p_result;
        }

        function points_subtract(p1, p2) {
            var p_result = {
                x: 0,
                y: 0,
            };
            p_result.x = p1.x - p2.x;
            p_result.y = p1.y - p2.y;
            return p_result;
        }

        function points_multiply(p1, p2) {
            var p_result = {
                x: 0,
                y: 0,
            };
            p_result.x = p1.x * p2.x;
            p_result.y = p1.y * p2.y;
            return p_result;
        }

        function points_divide(p1, p2) {
            var p_result = {
                x: 0,
                y: 0,
            };
            p_result.x = p1.x / p2.x;
            p_result.y = p1.y / p2.y;
            return p_result;
        }

        function points_calc_center(p1, p2) {
            var p_result = {
                x: 0,
                y: 0,
            };
            // var distances = points_calc_distances(p1, p2);
            var distances = points_subtract(p2, p1);
            var dist_half = point_divide_by(distances, 2);
            p_result = points_add(p1, dist_half);
            return p_result;
        }

        function points_calc_distances(p1, p2) {
            var p_result = {
                x: 0,
                y: 0,
            };
            var distances = points_subtract(p1, p2);
            p_result.x = Math.abs(distances.x);
            p_result.y = Math.abs(distances.y);
            return p_result;
        }

        function points_calc_distance(p1, p2) {
            var distances = points_calc_distances(p1, p2);
            // get distance with trigonometry
            // a²+b² = c²
            var distance = Math.sqrt(
                (distances.x * distances.x) +
                (distances.y * distances.y)
            );
            return distance;
        }

        function points_check_xy_higher_then(p1, p2, width, height) {
            var result = false;
            var distance = points_calc_distances(p1, p2);
            if (
                (distance.x > width) &&
                (distance.y > height)
            ) {
                result = true;
            }
            return result;
        }

        function points_remap_HighLow(p1, p2) {
            // switch between positiv and negative orientations..
            var result = {
                p1: {
                    x: 0,
                    y: 0,
                },
                p2: {
                    x: 0,
                    y: 0,
                },
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

        function points_remap_HighLow_Obj(points) {
            return points_remap_HighLow(points.p1, points.p2);
        }

        function point_round2multiple(p1, stepSize) {
            var p_result = {
                x: 0,
                y: 0,
            };
            // divide by stepSize
            var x1 = p1.x / stepSize;
            var y1 = p1.y / stepSize;
            // round
            var x2 = Math.round(x1);
            var y2 = Math.round(y1);
            // multiply by stepSize
            p_result.x = x2 * stepSize;
            p_result.y = y2 * stepSize;
            return p_result;
        }

        function point_find_nearest_snap(p1) {
            var stepSize = scope.settings.gridSnap.stepSize;
            return point_round2multiple(p1, stepSize);
        }

        function point_round2integer(point) {
            var p_result = {
                x: 0,
                y: 0,
            };
            p_result.x = parseInt(point.x, 10);
            p_result.y = parseInt(point.y, 10);
            return p_result;
        }

        function point_multiply_with(p1, value) {
            var p_result = {
                x: 0,
                y: 0,
            };
            p_result.x = p1.x * value;
            p_result.y = p1.y * value;
            return p_result;
        }

        function point_divide_by(p1, value) {
            var p_result = {
                x: 0,
                y: 0,
            };
            p_result.x = p1.x / value;
            p_result.y = p1.y / value;
            return p_result;
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



        /******************************************/
        /** mouse & touch helpers **/

        // var svg_base = document.getElementsByTagName("svg")[0];
        // var item_elements = svg_base.getElementsByClassName('item');

        scope.testCall = function(event, item) {
            console.group("testCall");
            console.log("event", event);
            console.log("item", item);
            console.groupEnd();
        };

        function mouse_touch_events_on(event, element, fn_move, fn_end) {
            if (event.type.startsWith('touch')) {
                // move
                svg_base_jql.on('touchmove', fn_move);
                // end
                svg_base_jql.on('touchend', fn_end);
                svg_base_jql.on('touchleave', fn_end);
                svg_base_jql.on('touchcancle', fn_end);
            } else {
                // move
                svg_base_jql.on('mousemove', fn_move);
                // end
                svg_base_jql.on('mouseup', fn_end);
                svg_base_jql.on('mouseleave', fn_end);
            }
        }

        function mouse_touch_events_off(event, element, fn_move, fn_end) {
            if (event.type.startsWith('touch')) {
                // move
                svg_base_jql.off('touchmove', fn_move);
                // end
                svg_base_jql.off('touchend', fn_end);
                svg_base_jql.off('touchleave', fn_end);
                svg_base_jql.off('touchcancle', fn_end);
            } else {
                // move
                svg_base_jql.off('mousemove', fn_move);
                // end
                svg_base_jql.off('mouseup', fn_end);
                svg_base_jql.off('mouseleave', fn_end);
            }
        }

        // returns touches array with on element (the event)
        function get_vtouches(event) {
            // check for touch or mouse event
            var touches = [];
            if (event.type.startsWith('touch')) {
                touches = event.changedTouches;
            } else {
                // normal mouse event
                // add fake touch:
                touches.push(event);
                if (!touches[0].hasOwnProperty('identifier')) {
                    touches[0].identifier = 0;
                }
            }
            return touches;
        }

        function get_touch_by_identifier(touches, identifier) {
            var touch = null;
            // var i = 0;
            // while ( (i < touches.length) && (!touch) ) {
            //
            //     i++;
            // }
            for (var i = 0; (i < touches.length) && (!touch); i++) {
                if (touches[i].identifier == identifier) {
                    touch = touches[i];
                }
            }
            return touch;
        }

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

        // var item_moving_clean = {
        //     touch_id: null,
        //     p_start : {},
        //     moved: false,
        //     item: {},
        //     offset: {
        //         x: 0,
        //         y: 0,
        //     },
        //     selected: [
        //         {
        //             item:{}, // reference to item
        //             offset:{
        //                 x: 0,
        //                 y: 0,
        //             }
        //         }
        //     ],
        // };

        var item_moving_data = {};

        var item_moving_clickprevent = [];

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



        function item_moving_add(p_start, item, identifier, master, event) {
            var add_successfull = false;
            // console.log("item_moving_data", item_moving_data);
            // check so we don't add the draged item again.
            // and check if last touch was this item (handles touch+click bugs)

            // console.log(
            //     "item.id",
            //     item.id
            // );
            // console.log(
            //     "item_moving_clickprevent.indexOf(item.id)",
            //     item_moving_clickprevent.indexOf(item.id)
            // );
            if (
                ( !item_moving_data.hasOwnProperty(item.id) ) &&
                ( item_moving_clickprevent.indexOf(item.id) == -1 )
            ) {

                if (event.type.startsWith('touch')) {
                    item_moving_clickprevent.push(item.id);
                }

                var i_new = {
                    item: {}, // reference to item
                    identifier: {},
                    element: {},
                    offset: {
                        x: 0,
                        y: 0,
                    },
                    p_start: {},
                    moved: false,
                    master: null,
                };
                // set reference
                i_new.item = item;
                i_new.identifier = identifier;
                i_new.element = svg_base.getElementById(i_new.item.id);
                i_new.master = master;

                // save p_start for later move distance calculation
                i_new.p_start = p_start;

                // calculate & set offset
                i_new.offset = points_subtract(
                    item.position,
                    p_start
                );

                // add to list
                item_moving_data[item.id] = i_new;
                add_successfull = true;
            } else {
                // console.log("item '" + item.id + "' already handled.");
            }
            // console.log("item_moving_data", item_moving_data);
            return add_successfull;
        }

        function item_moving_update(p_current, identifier) {
            angular.forEach(item_moving_data, function(i_move, id) {
                if (i_move.identifier == identifier) {

                    // check if mouse moved
                    if (!i_move.moved) {
                        var dist = points_calc_distance(p_current, i_move.p_start);
                        if (dist > 10) {
                            i_move.moved = true;
                        }
                    }

                    // check if snapping is enabled
                    // && i_move has a master
                    if (
                        (scope.settings.move.snap) &&
                        (i_move.master !== null)
                    ) {
                        // console.log("1", p_current);
                        // first calculate offset for master
                        // calculate new position
                        var p_master = points_add(
                            item_moving_data[i_move.master].offset,
                            p_current
                        );
                        // convert to integer (strip all fractions)
                        p_master = point_round2integer(p_master);

                        // snap
                        p_master = point_find_nearest_snap(p_master);

                        // remove offset of master
                        // so that all selected are moved relative with snapping
                        p_current = points_subtract(
                            p_master,
                            item_moving_data[i_move.master].offset
                        );

                        // convert to integer (strip all fractions)
                        p_master = point_round2integer(p_master);

                        // console.log("2", p_current);
                    }

                    // calculate new position
                    var p_new = points_add(i_move.offset, p_current);

                    // convert to integer (strip all fractions)
                    var p_clean = point_round2integer(p_new);

                    // check if snapping is enabled
                    if (
                        (scope.settings.move.snap) &&
                        (i_move.master === null)
                    ) {
                        // snap
                        p_clean = point_find_nearest_snap(p_clean);
                    }

                    // set item position
                    i_move.item.position.x = p_clean.x;
                    i_move.item.position.y = p_clean.y;
                    // scope.$apply();
                    i_move.element.x.baseVal.value = p_clean.x;
                    i_move.element.y.baseVal.value = p_clean.y;
                }
            });
        }

        function item_moving_remove_clickprevent(item_id) {
            // console.log("delayed delete '" + item_id + "'");
            var item_index = item_moving_clickprevent.indexOf(item_id);
            if (item_index != -1) {
                item_moving_clickprevent.splice(
                    item_index,
                    1
                );
            }
        }

        function item_moving_remove(identifier, event) {
            // find i_move
            var removed_master_id = null;
            angular.forEach(item_moving_data, function(i_move, item_id) {
                // console.log("  i_move", i_move);
                // console.log("  identifier", identifier);

                if (i_move.identifier == identifier) {
                    if (i_move.master === null) {
                        // console.log("i_move found.");
                        // console.log("-->  event", event);
                        // check for
                        //     select is enabled
                        //     event.type is mouse
                        //     was not a moving operation
                        if (
                            (scope.settings.select.enabled) &&
                            // (event.type == 'mouseup') &&
                            (
                                (event.type == 'mouseup') ||
                                (event.type == 'touchend')
                            ) &&
                            (!i_move.moved)
                        ) {
                            // console.log("!i_move.moved");
                            // console.log("-->  event", event);
                            // console.log("event_type", event_type);
                            // console.log("i_move", i_move);
                            // console.log(
                            //     "item_moving_data.item",
                            //     item_moving_data.item
                            // );
                            // console.log("toggle selection:");
                            item_selection_toggle(i_move.item);
                        }

                        // remember id
                        removed_master_id = item_id;

                        // delete self
                        delete item_moving_data[item_id];
                        // var delete_success = delete item_moving_data[item_id];
                        // console.log(
                        //     "deleted item_moving_data[item_id (" +
                        //     item_id +
                        //     ")]",
                        //     delete_success
                        // );

                        // only unbind event handler when no more targets in process
                        if (Object.keys(item_moving_data).length === 0) {
                            mouse_touch_events_off(
                                event,
                                svg_base_jql,
                                item_moving_move,
                                item_moving_end
                            );
                        }

                        scope.$apply();

                        // delay delete of item_moving_clickprevent entry
                        $timeout(function () {
                            item_moving_remove_clickprevent(item_id);
                        }, 100);
                    }
                }
            });
            // check for slaves
            // console.log("removed_master_id", removed_master_id);
            angular.forEach(item_moving_data, function(i_move, i_move_id) {
                if (i_move.identifier == identifier) {
                    if (i_move.master == removed_master_id) {
                        // console.log("i_move", i_move);
                        // delete self
                        delete item_moving_data[i_move_id];
                        // var delete_success = delete item_moving_data[i_move_id];
                        // console.log(
                        //     "- deleted item_moving_data[i_move_id (" +
                        //     i_move_id +
                        //     ")]",
                        //     delete_success
                        // );
                        // console.log("item_moving_data", item_moving_data);
                        item_moving_remove_clickprevent(i_move_id);
                    }
                }
            });
        }


        // main event handlers:
        function item_moving_start(event, item) {
            // console.log("item_moving_start", event);

            // check if moveing is allowed.
            if (
                (scope.settings.select.enabled) ||
                (scope.settings.move.enabled)
            ){

                // Prevent default dragging of selected content
                event.preventDefault();
                // prevent box selection to trigger
                event.stopPropagation();

                var add_successfull = false;

                var touches = get_vtouches(event);
                // use first touch in list
                // only on touch per item is allowed.
                var touch = touches[0];

                // create svg point with screen coordinates
                var p_start = convert_xy_2_SVG_coordinate_point(
                    touch.clientX,
                    touch.clientY
                );

                add_successfull = item_moving_add(
                    p_start,
                    item,
                    touch.identifier,
                    null, // master
                    event
                );
                // console.log("add_successfull", add_successfull);

                // if new master item then add events
                if (add_successfull) {

                    if (scope.settings.move.selected) {
                        var add_successfull_selected = false;
                        // do all the above for every selected item
                        angular.forEach(scope.selected, function(s_item, key) {
                            add_successfull_selected |= item_moving_add(
                                p_start,
                                s_item,
                                touch.identifier,
                                item.id, // set master
                                event
                            );
                        });
                    }
                    // console.log("add_successfull", add_successfull);

                    // console.log("item_moving_data", item_moving_data);

                    // console.log("add event listener for", event.type);
                    // setup event listeners
                    mouse_touch_events_on(
                        event,
                        svg_base_jql,
                        item_moving_move,
                        item_moving_end
                    );

                }

            } // move or select enabled

        }
        scope.item_moving_start = item_moving_start;

        function item_moving_move(event) {
            // console.log("item_moving_move", event.target);

            // check if moveing is allowed.
            if (scope.settings.move.enabled) {

                var touches = get_vtouches(event);

                // console.log("item", item);
                for (var t_index = 0; t_index < touches.length; t_index++) {
                    var touch = touches[t_index];

                    var p_current = convert_xy_2_SVG_coordinate_point(
                        touch.clientX,
                        touch.clientY
                    );

                    item_moving_update(p_current, touch.identifier);
                }

            } // end if move.enabled

        }

        function item_moving_end(event) {
            // console.log("item_moving_end");

            var touches = get_vtouches(event);

            // console.log("touches", touches);
            for (var t_index = 0; t_index < touches.length; t_index++) {
                var touch = touches[t_index];

                item_moving_remove(touch.identifier, event);
            }

            // console.log("item_moving_data", item_moving_data);

            // only unbind event handler when no more targets in process
            if (Object.keys(item_moving_data).length === 0) {
                mouse_touch_events_off(
                    event,
                    svg_base_jql,
                    item_moving_move,
                    item_moving_end
                );
            }
            // now done in delayed element delete..

            // make all changes visible
            scope.$apply();
        }


        // function item_moving_init() {
        //     scope.items.forEach(function(item, index, items){
        //         var element = svg_base.getElementById(item.id);
        //         angular.element(element).on('mousedown', item_moving_start);
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
                p1: {
                    x: 0,
                    y: 0,
                },
                p2: {
                    x: 0,
                    y: 0,
                },
            },
            current: {
                p1: {
                    x: 0,
                    y: 0,
                },
                p2: {
                    x: 0,
                    y: 0,
                },
            },
            touch_id: 0,
        };

        // getIntersectionList
        // getEnclosureList(in SVGRect rect, in SVGElement referenceElement)
        // this functions are not implemented in firefox :-(

        function itemGetPoints(item) {
            var result_points = {
                p1: {
                    x: 0,
                    y: 0,
                },
                p2: {
                    x: 0,
                    y: 0,
                },
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
            if(scope.settings.box_select.forceItemEnclosure){
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
        // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
        svg_base_jql.on('mousedown', box_select_start);
        svg_base_jql.on('touchstart', box_select_start);

        // main event handlers:
        function box_select_start(event) {

            // check if box_select is enabled
            if (scope.settings.box_select.enabled) {

                // // only start if no active touch
                if (!box_select_data.active) {

                    // Prevent default dragging of selected content
                    event.preventDefault();
                    // prevent other things to trigger
                    // event.stopPropagation();

                    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
                    // console.log("event", event);
                    // console.log("event.type", event.type);
                    // console.log("event.pageX", event.pageX);
                    // console.log("event.screenX", event.screenX);
                    // console.log("event.clientX", event.clientX);
                    // console.log("event.offsetX", event.offsetX);

                    // console.log("event.movementX", event.movementX);
                    // console.log("scope", scope);



                    var touches = get_vtouches(event);
                    // use first touch in list
                    // only on touch per item is allowed.
                    var touch = touches[0];

                    // save identifier for later use
                    box_select_data.touch_id = touch.identifier;

                    // create svg point with screen coordinates
                    var p_start = convert_xy_2_SVG_coordinate_point(
                        touch.clientX,
                        touch.clientY
                    );

                    // transform
                    box_select_data.start.p1 = p_start;
                    // for init set p2 to same values
                    box_select_data.start.p2 = p_start;
                    // console.log("box_select_data", box_select_data);

                    // set position
                    box_select_set_position_size(box_select_data.start);

                    // set box_select active
                    box_select_data.active = true;
                    // box_select.addClass('active');
                    box_select.classList.add('active');

                    // setup event listeners
                    mouse_touch_events_on(
                        event,
                        svg_base_jql,
                        box_select_move,
                        box_select_end
                    );

                } // if not active

            } // end box_select.enabled

        }

        function box_select_move(event) {
            // console.log("event", event);

            var touches = get_vtouches(event);
            var touch = get_touch_by_identifier(
                touches,
                box_select_data.touch_id
            );

            // only process if we have found a touch with the right identifier
            if (touch) {

                // create svg point with screen coordinates
                var p_current = convert_xy_2_SVG_coordinate_point(
                    touch.clientX,
                    touch.clientY
                );

                box_select_data.current = points_remap_HighLow(
                    box_select_data.start.p1,
                    p_current
                );
                // set size
                box_select_set_position_size(box_select_data.current);
                // update selection
                selectCoverdItems(box_select_data.current);

            } // if touch

        }

        function box_select_end(event) {

            var touches = get_vtouches(event);
            var touch = get_touch_by_identifier(
                touches,
                box_select_data.touch_id
            );

            // only process if we have found a touch with the right identifier
            if (touch) {

                mouse_touch_events_off(
                    event,
                    svg_base_jql,
                    box_select_move,
                    box_select_end
                );
                box_select_data.active = false;
                box_select.classList.remove('active');

            } // if touch
        }


        /******************************************/
        /** handle world pan **/

        // currentTranslate
        // var el = document.getElementsByTagName("svg")[0];

        var pan_data = {
            identifier: null,
            p_start: {},
            p_last: {},
        };

        svg_base_jql.on('mousedown', pan_start);
        svg_base_jql.on('touchstart', pan_start);


        function pan_start(event) {

            // check if box_select is enabled
            if (scope.settings.world.pan.enabled) {

                // Prevent default dragging of selected content
                event.preventDefault();
                // prevent other things to trigger
                // event.stopPropagation();

                // console.log("scope", scope);

                var touches = get_vtouches(event);
                // use first touch in list
                // only on touch per item is allowed.
                var touch = touches[0];

                // save identifier for later use
                pan_data.identifier = touch.identifier;

                // create svg point with screen coordinates
                var p_start = convert_xy_2_SVG_coordinate_point(
                    touch.clientX,
                    touch.clientY
                );

                pan_data.p_start = p_start;
                pan_data.p_last = p_start;

                // setup event listeners
                mouse_touch_events_on(
                    event,
                    svg_base_jql,
                    pan_move,
                    pan_end
                );

            } // end pan.enabled

        }

        function pan_move(event) {
            // console.log("event", event);

            var touches = get_vtouches(event);
            var touch = get_touch_by_identifier(
                touches,
                pan_data.identifier
            );

            // only process if we have found a touch with the right identifier
            if (touch) {

                // create svg point with screen coordinates
                var p_current = convert_xy_2_SVG_coordinate_point(
                    touch.clientX,
                    touch.clientY
                );

                var p_offset = points_subtract(
                    pan_data.p_last,
                    p_current
                );

                var p_new = points_add(
                    scope.settings.world.pan,
                    p_offset
                );

                // set values separate so the object ref is not touched..
                scope.settings.world.pan.x = p_new.x;
                scope.settings.world.pan.y = p_new.y;

                // update view
                scope.$apply();

            } // if touch

        }

        function pan_end(event) {
            mouse_touch_events_off(
                event,
                svg_base_jql,
                pan_move,
                pan_end
            );
            // console.log("event", event);
        }

        /******************************************/
        /** handle world pan&zoom key controls   **/

        // svg_base_jql.on('keypress', pan_key);
        $document.on('keydown', panzoom_key);

        var panzoom_key_enabled = false;
        svg_base_jql.on('mouseenter', function(event) {
            panzoom_key_enabled = true;
            // console.log("mouseenter", panzoom_key_enabled);
        });
        svg_base_jql.on('mouseleave', function(event) {
            panzoom_key_enabled = false;
            // console.log("mouseleave", panzoom_key_enabled);
        });
        // keydown reports arrowKeys - keypress not.

        function panzoom_key(event) {
            // console.group("pan_key", event);
            // console.log("target:", event.target);
            // console.log("currentTarget:", event.currentTarget);
            // console.log("$document[0].getElementsByTagName('body')[0]:", $document[0].getElementsByTagName('body')[0]);
            // console.groupEnd();
            // console.log("which:", event.which);

            // console.log("currentTarget:", event.currentTarget);
            // if (event.target == $document[0].getElementsByTagName('body')[0]) {
            if (panzoom_key_enabled) {
                // console.log("target:", event.target);



                // new API:
                // switch (event.key) {
                //     case "ArrowDown":
                //       // Do something for "down arrow" key press.
                //       break;
                //     case "ArrowUp":
                //       // Do something for "up arrow" key press.
                //       break;
                //     case "ArrowLeft":
                //       // Do something for "left arrow" key press.
                //       break;
                //     case "ArrowRight":
                //       // Do something for "right arrow" key press.
                //       break;
                //     default:
                //       return; // Quit when this doesn't handle the key event.
                //   }

                var offset = {
                    x: 0,
                    y: 0,
                    factor: 0,
                };
                var navKey = false;

                // console.log("which:", event.which);

                // normalized by jQuery
                // http://api.jquery.com/event.which/
                switch (event.which) {
                    case 36:
                        // "Home"
                        // console.log("Home");
                        navKey = 'setdirekt';
                        offset.x  = 0;
                        offset.y  = 0;
                        offset.factor = 1;
                        break;
                    case 37:
                        // "ArrowLeft"
                        // console.log("ArrowLeft");
                        navKey = true;
                        offset.x  = -1;
                        offset.y  = 0;
                        break;
                    case 38:
                        // "ArrowUp"
                        navKey = true;
                        offset.x  = 0;
                        offset.y  = -1;
                        break;
                    case 39:
                        // "ArrowRight"
                        navKey = true;
                        offset.x  = 1;
                        offset.y  = 0;
                        break;
                    case 40:
                        // "ArrowDown"
                        navKey = true;
                        offset.x  = 0;
                        offset.y  = 1;
                        break;
                    case 107:
                        // "NumPad +"
                    case 171:
                        // "+"
                        navKey = true;
                        offset.factor  = 1;
                        break;
                    case 109:
                        // "NumPad -"
                    case 173:
                        // "-"
                        navKey = true;
                        offset.factor  = -1;
                        break;
                }

                // console.log("offset:", offset);
                // console.log("navKey:", navKey);
                // if ( (event.key >= 39) && (event.key <= 40)) {
                if (navKey) {

                    // Prevent default scrooling in site
                    event.preventDefault();
                    // prevent other things to trigger
                    event.stopPropagation();

                    // console.log("offset:", offset);
                    var newvalues = {
                        x: 0,
                        y: 0,
                        factor: 1,
                    };

                    // use direct or offset mode
                    if (navKey == 'setdirekt') {
                        newvalues.x = offset.x;
                        newvalues.y = offset.y;
                        newvalues.factor = offset.factor;
                    } else {

                        // default offset calculation
                        var speed = {
                            x: 10,
                            y: 10,
                            factor: 0.01, // 0.01 steps
                        };


                        // fast mode
                        if (event.shiftKey) {
                            speed.x = 250;
                            speed.y = 250;
                            speed.factor = 0.1;
                        }

                        // super fast mode
                        if (event.shiftKey && event.altKey) {
                            speed.x = 1000;
                            speed.y = 1000;
                            speed.factor = 1;
                        }

                        // calculate offset
                        offset.x = offset.x * speed.x;
                        offset.y = offset.y * speed.y;
                        offset.factor = offset.factor * speed.factor;

                        // calculate new values
                        newvalues.x =
                            scope.settings.world.pan.x + offset.x;
                        newvalues.y =
                            scope.settings.world.pan.y + offset.y;

                        newvalues.factor =
                            scope.settings.world.zoom.factor + offset.factor;


                    }

                    // fit all values to limits
                    newvalues.x = fit_to_limits(
                        newvalues.x,
                        (scope.settings.world.width*-1),
                        scope.settings.world.width
                    );

                    newvalues.y = fit_to_limits(
                        newvalues.y,
                        (scope.settings.world.height*-1),
                        scope.settings.world.height
                    );

                    newvalues.factor = fit_to_limits(
                        newvalues.factor,
                        0.5,
                        40
                    );

                    // check if pan is enabled
                    if (scope.settings.world.pan.enabled) {
                        // set values separate so the object ref is not touched..
                        scope.settings.world.pan.x = newvalues.x;
                        scope.settings.world.pan.y = newvalues.y;
                    }
                    // check if zoom is enabled
                    if (scope.settings.world.zoom.enabled) {
                        scope.settings.world.zoom.factor = newvalues.factor;
                    }

                    // update view
                    scope.$apply();

                } // if offset

            } // if panzoom_key_enabled

        }

        /******************************************/
        /** handle world zoom **/

        function zoom_to_cursor(p_current, zoom_factor) {
            var p_new = {
                x: 0,
                y: 0,
            };
            // divide by zoom factor
            var p_offset = point_divide_by(p_current, zoom_factor);
            p_new = points_subtract(p_current, p_offset);
            return p_new;
        }


        svg_base_jql.on('wheel', zoom_wheel);

        function zoom_wheel(event) {
            // console.log("event", event);
            // console.group("event", event);
            // console.log("deltaX", event.deltaX);
            // console.log("deltaY", event.deltaY);
            // console.log("deltaZ", event.deltaZ);
            // console.log("deltaMode", event.deltaMode);
            // // const DOM_DELTA_PIXEL = 0x00;
            // // const DOM_DELTA_LINE = 0x01;
            // // const DOM_DELTA_PAGE = 0x02;
            // var DOM_DELTA_PIXEL = 0x00;
            // var DOM_DELTA_LINE = 0x01;
            // var DOM_DELTA_PAGE = 0x02;
            // switch (event.deltaMode) {
            //     case DOM_DELTA_PIXEL:
            //         console.log("DOM_DELTA_PIXEL");
            //         break;
            //     case DOM_DELTA_LINE:
            //         console.log("DOM_DELTA_LINE");
            //         break;
            //     case DOM_DELTA_PAGE:
            //         console.log("DOM_DELTA_PAGE");
            //         break;
            // }
            // console.groupEnd();

            // check if box_select is enabled
            if (scope.settings.world.zoom.enabled) {

                var f_current = scope.settings.world.zoom.factor;

                // fixed offset per event.
                var f_offset = 0.01;
                // var f_offset = event.deltaY / 100;
                // would be an idea
                // to increas offset in proportion to zoom factor
                // console.log("f_offset", f_offset);
                f_offset = f_current / 100;
                f_offset = Number(f_offset.toFixed(2));
                // console.log("f_current", f_current);
                // console.log("f_offset", f_offset);

                // get direction from deltaY
                if (event.deltaY > 0) {
                    f_offset = f_offset * -1;
                }

                // calculate new value
                var f_new = f_current + f_offset;

                f_new = Number(f_new.toFixed(2));

                // check for min
                if (f_new <= 0.5) {
                    f_new = 0.5;
                }

                // check for max
                if (f_new >= 40) {
                    f_new = 40;
                }

                // console.log("f_new", f_new);
                // set value
                scope.settings.world.zoom.factor = f_new;

                // update view
                scope.$apply();

            } // if zoom enabled

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
};}
]);
