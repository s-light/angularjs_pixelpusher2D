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
    // '$parse',
    // '$timeout',
    '$filter',
    // '$document',
function(
    // $parse,
    // $timeout,
    $filter
    // $document
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
        // var box_select = document.getElementsByTagName("svg")[0].getElementById("box_select");box_select.classList.add('enabled');

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
            item_moving_data.selected.length = 0;
            // fill list:
            angular.forEach(scope.selected, function(s_item, key) {
                // check so we don't add the draged item again.
                if (s_item !== item_moving_data.item) {
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
                    item_moving_data.selected.push(si_new);
                }
            });
        }

        function item_moving_selected_update(p_current) {
            angular.forEach(item_moving_data.selected, function(si_data, key) {
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





        function item_moving_add(p_start, item, identifier, master) {
            var add_successfull = false;
            // console.log("item_moving_data", item_moving_data);
            // check so we don't add the draged item again.
            if (!item_moving_data.hasOwnProperty(item.id)) {
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
                        var dist = points_get_distance(p_current, i_move.p_start);
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

        function item_moving_remove_imove_delete(event, delete_id) {
            // console.log("delayed delete '" + delete_id + "'");
            // delete self
            delete item_moving_data[delete_id];

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
        }

        function item_moving_remove(identifier, event) {
            // find i_move
            var removed_master_id = null;
            angular.forEach(item_moving_data, function(i_move, id) {
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
                        removed_master_id = i_move.item.id;

                        item_moving_remove_imove_delete(event, id);
                        // delay delete so the pointer click event does not get through
                        // $timeout(function () {
                        //     item_moving_remove_imove_delete(event, id);
                        // }, 100);
                    }
                }
            });
            // check for slaves
            angular.forEach(item_moving_data, function(i_move, id) {
                if (i_move.identifier == identifier) {
                    if (i_move.master == removed_master_id) {
                        // delete self
                        delete item_moving_data[id];
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
                    null // master
                );
                // console.log("add_successfull", add_successfull);

                if (scope.settings.move.selected) {
                    var add_successfull_selected = false;
                    // do all the above for every selected item
                    // item_moving_selected_prepare(p_current);
                    angular.forEach(scope.selected, function(s_item, key) {
                        add_successfull_selected |= item_moving_add(
                            p_start,
                            s_item,
                            touch.identifier,
                            item.id // set master
                        );
                    });
                }
                // console.log("add_successfull", add_successfull);

                // console.log("item_moving_data", item_moving_data);

                // if new items then add events
                if (add_successfull) {
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

            // check for touch or mouse event
            var touches = [];
            if (event.type.startsWith('touch')) {
                touches = event.changedTouches;
            } else {
                // normal mouse event
                // add fake touch:
                touches.push(event);
                touches[0].identifier = 0;
            }

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
                p1: svg_base.createSVGPoint(),
                p2: svg_base.createSVGPoint(),
            },
            current: {
                p1: svg_base.createSVGPoint(),
                p2: svg_base.createSVGPoint(),
            },
            touch_id: 0,
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

                box_select_data.current = remap_points(
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
        /** handle zoom / pan **/

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

            } // end move.enabled

        }

        function pan_move(event) {
            // console.log("event", event);

            var touches = get_vtouches(event);
            var touch = get_touch_by_identifier(
                touches,
                pan_data.identifier
            );

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

        }

        function pan_end(event) {
            mouse_touch_events_off(
                event,
                svg_base_jql,
                pan_move,
                pan_end
            );
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

/*
ngTouchstart
not official part of angularjs 1.4.4 - so manualy added here:
code copied from
https://github.com/angular/angular.js/blob/g3_v1_4/src/ng/directive/ngEventDirs.js
http://stackoverflow.com/a/32238039/574981
*/
myDirectivesShapePusher.directive('ngTouchstart', [
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
